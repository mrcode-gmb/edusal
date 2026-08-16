import { useState, type FC } from 'react';
import type { InstitutionHierarchyTree } from '../../types/institution';
import {
  FolderTreeIcon,
  LayersIcon,
  PlusIcon,
  ClockIcon,
  BriefcaseIcon,
  BuildingIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '../icons';

interface AcademicHierarchyTreeProps {
  tree: InstitutionHierarchyTree | null;
  loading: boolean;
  onAddDivision: () => void;
  onAddDepartment: (divisionId: string) => void;
  onAddProgram: (departmentId: string) => void;
}

export const AcademicHierarchyTree: FC<AcademicHierarchyTreeProps> = ({
  tree,
  loading,
  onAddDivision,
  onAddDepartment,
  onAddProgram,
}) => {
  const [collapsedDivisions, setCollapsedDivisions] = useState<Record<string, boolean>>({});
  const [collapsedDepartments, setCollapsedDepartments] = useState<Record<string, boolean>>({});

  if (loading) {
    return (
      <div className="tree-loading-box">
        <div className="tree-spinner"></div>
        <p>Loading 4-tier academic hierarchy tree...</p>
      </div>
    );
  }

  if (!tree) {
    return <div className="tree-empty-box">No institutional hierarchy data available.</div>;
  }

  const toggleDivision = (divId: string) => {
    setCollapsedDivisions((prev) => ({ ...prev, [divId]: !prev[divId] }));
  };

  const toggleDepartment = (deptId: string) => {
    setCollapsedDepartments((prev) => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  return (
    <div className="hierarchy-tree-card">
      {/* Tree Top Bar */}
      <div className="tree-header-bar">
        <div className="tree-title-group">
          <div className="tree-badge-row">
            <span className="tier-tag tier-1">
              <BuildingIcon size={13} /> Tier 1: Institutional Root
            </span>
            <span className="regulator-pill">{tree.regulator} Regulated</span>
            <span className="type-pill">{tree.institution_type}</span>
          </div>
          <h3 className="tree-institution-name">{tree.name}</h3>
          <p className="tree-institution-sub">
            Native Tier-2 Terminology: <strong>{tree.tier_two_term}</strong> · Standardized 4-Tier Hierarchy Architecture
          </p>
        </div>

        <button type="button" className="btn btn-primary-sm" onClick={onAddDivision}>
          <PlusIcon size={15} /> Add {tree.tier_two_term === 'SCHOOL' ? 'School' : 'Faculty'}
        </button>
      </div>

      {/* Tree Visual Body */}
      <div className="tree-body">
        {tree.divisions.length === 0 ? (
          <div className="tree-empty-divisions">
            <FolderTreeIcon size={32} color="#94a3b8" />
            <p>No academic divisions configured yet.</p>
            <button type="button" className="btn btn-secondary-sm" onClick={onAddDivision}>
              Create First {tree.tier_two_term === 'SCHOOL' ? 'School' : 'Faculty'}
            </button>
          </div>
        ) : (
          <div className="divisions-tree-list">
            {tree.divisions.map((div) => {
              const isDivCollapsed = collapsedDivisions[div.id] || false;
              return (
                <div key={div.id} className="division-node">
                  {/* Division Node Header */}
                  <div className="division-header">
                    <button
                      type="button"
                      className="collapse-btn"
                      onClick={() => toggleDivision(div.id)}
                      aria-label="Toggle division details"
                    >
                      {isDivCollapsed ? <ChevronRightIcon size={16} /> : <ChevronDownIcon size={16} />}
                    </button>

                    <div className="node-icon-box division-icon">
                      <LayersIcon size={16} color="#ffffff" />
                    </div>

                    <div className="node-info" onClick={() => toggleDivision(div.id)}>
                      <div className="node-title-row">
                        <span className="node-tier-label">Tier 2: {tree.tier_two_term}</span>
                        <h4 className="node-title">{div.name}</h4>
                        {div.code && <span className="node-code">[{div.code}]</span>}
                      </div>
                      <p className="node-dean">
                        Dean: <strong>{div.dean_name || 'Not assigned'}</strong>
                      </p>
                    </div>

                    <div className="node-actions">
                      <span className="node-count-badge">
                        {div.departments.length} {div.departments.length === 1 ? 'Department' : 'Departments'}
                      </span>
                      <button
                        type="button"
                        className="btn-action-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddDepartment(div.id);
                        }}
                      >
                        <PlusIcon size={13} /> Add Dept
                      </button>
                    </div>
                  </div>

                  {/* Division Children (Departments) */}
                  {!isDivCollapsed && (
                    <div className="departments-tree-list">
                      {div.departments.length === 0 ? (
                        <div className="department-empty-prompt">
                          <span>No departments under this division yet.</span>
                          <button
                            type="button"
                            className="btn-link"
                            onClick={() => onAddDepartment(div.id)}
                          >
                            Add Department →
                          </button>
                        </div>
                      ) : (
                        div.departments.map((dept) => {
                          const isDeptCollapsed = collapsedDepartments[dept.id] || false;
                          return (
                            <div key={dept.id} className="department-node">
                              {/* Department Header */}
                              <div className="department-header">
                                <button
                                  type="button"
                                  className="collapse-btn-sm"
                                  onClick={() => toggleDepartment(dept.id)}
                                >
                                  {isDeptCollapsed ? (
                                    <ChevronRightIcon size={14} />
                                  ) : (
                                    <ChevronDownIcon size={14} />
                                  )}
                                </button>

                                <div className="dept-info" onClick={() => toggleDepartment(dept.id)}>
                                  <div className="dept-title-row">
                                    <span className="node-tier-label-sm">Tier 3: Dept</span>
                                    <h5 className="dept-name">{dept.name}</h5>
                                    {dept.code && <span className="dept-code">{dept.code}</span>}
                                    {dept.siwes_eligible ? (
                                      <span className="siwes-badge siwes-yes">SIWES Eligible</span>
                                    ) : (
                                      <span className="siwes-badge siwes-no">Non-SIWES Track</span>
                                    )}
                                  </div>
                                  <span className="dept-hod">HOD: {dept.hod_name || 'Unassigned'}</span>
                                </div>

                                <div className="dept-actions">
                                  <span className="program-count-badge">
                                    {dept.programs.length} {dept.programs.length === 1 ? 'Program' : 'Programs'}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn-action-ghost-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAddProgram(dept.id);
                                    }}
                                  >
                                    <PlusIcon size={12} /> Add Program
                                  </button>
                                </div>
                              </div>

                              {/* Department Children (Programs) */}
                              {!isDeptCollapsed && (
                                <div className="programs-tree-list">
                                  {dept.programs.length === 0 ? (
                                    <div className="program-empty-prompt">
                                      <span>No degree options configured.</span>
                                      <button
                                        type="button"
                                        className="btn-link"
                                        onClick={() => onAddProgram(dept.id)}
                                      >
                                        Add Program Option →
                                      </button>
                                    </div>
                                  ) : (
                                    dept.programs.map((prog) => (
                                      <div key={prog.id} className="program-leaf-node">
                                        <span className="leaf-tier-tag">Tier 4: Leaf Option</span>
                                        <div className="leaf-info">
                                          <div className="leaf-title-row">
                                            <span className="leaf-title">{prog.name}</span>
                                            {prog.program_code && (
                                              <code className="leaf-code">{prog.program_code}</code>
                                            )}
                                          </div>
                                          <div className="leaf-meta-row">
                                            <span className="award-pill">{prog.award_level_display}</span>
                                            <span className="duration-pill">
                                              <ClockIcon size={12} /> {prog.duration_years} Years
                                            </span>
                                            {prog.siwes_duration_months > 0 && (
                                              <span className="siwes-duration-pill">
                                                <BriefcaseIcon size={12} /> {prog.siwes_duration_months} Months SIWES
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
