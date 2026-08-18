import logging
from typing import Optional
from django.db import transaction

from nexus.institutions.models import (
    AcademicProgram,
    Pathway,
    PathwayMilestone,
    TemplateVisibility,
)

logger = logging.getLogger(__name__)


class PathwayTemplateService:
    """Service for managing, publishing, and deep-cloning pathway blueprint templates."""

    @classmethod
    def clone_template_to_program(
        cls,
        template_id: str,
        target_program: AcademicProgram,
        user=None,
        custom_title: Optional[str] = None,
        custom_description: Optional[str] = None,
    ) -> Pathway:
        """
        Deep-copies a master template pathway and all its sequenced milestones
        to a target academic program. Runs inside an atomic transaction.
        """
        with transaction.atomic():
            template = (
                Pathway.objects.select_related("program", "institution")
                .prefetch_related("milestones")
                .get(id=template_id)
            )

            new_title = custom_title.strip() if custom_title and custom_title.strip() else f"{template.title} (Customized)"

            new_pathway = Pathway.objects.create(
                institution=target_program.institution,
                program=target_program,
                created_by=user,
                title=new_title,
                career_role=template.career_role,
                industry_sector=template.industry_sector,
                description=custom_description or template.description,
                target_cgpa_recommendation=template.target_cgpa_recommendation,
                is_active=True,
                is_template=False,
                template_visibility=TemplateVisibility.DEPARTMENT,
                cloned_from=template,
                version=1,
            )

            cloned_milestones = []
            for m in template.milestones.all().order_by("order_index", "year_of_study"):
                cloned_milestones.append(
                    PathwayMilestone(
                        pathway=new_pathway,
                        order_index=m.order_index,
                        year_of_study=min(m.year_of_study, target_program.duration_years),
                        target_level_code=m.target_level_code,
                        target_semester=m.target_semester,
                        title=m.title,
                        description=m.description,
                        milestone_type=m.milestone_type,
                        points=m.points,
                        is_mandatory=m.is_mandatory,
                        verification_method=m.verification_method,
                        required_evidence_type=m.required_evidence_type,
                        competency_tags=list(m.competency_tags) if m.competency_tags else [],
                    )
                )

            PathwayMilestone.objects.bulk_create(cloned_milestones)
            new_pathway.recalculate_totals()

            logger.info(
                f"Successfully cloned template '{template.title}' -> '{new_pathway.title}' "
                f"with {len(cloned_milestones)} milestones ({new_pathway.total_points} pts)."
            )
            return new_pathway

    @classmethod
    def publish_as_template(
        cls,
        pathway_id: str,
        visibility: str = TemplateVisibility.INSTITUTION,
    ) -> Pathway:
        """Publishes an active custom pathway as a master reusable blueprint."""
        pathway = Pathway.objects.get(id=pathway_id)
        pathway.is_template = True
        pathway.template_visibility = visibility
        pathway.save(update_fields=["is_template", "template_visibility", "updated_at"])
        logger.info(f"Published pathway '{pathway.title}' as template blueprint with visibility '{visibility}'.")
        return pathway
