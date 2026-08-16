import logging
from typing import List

logger = logging.getLogger(__name__)

# Global singleton instance for TextEmbedding
_embedding_model = None


def get_embedding_model():
    """Lazily loads the FastEmbed ONNX embedding model (384 dimensions)."""
    global _embedding_model
    if _embedding_model is None:
        try:
            from fastembed import TextEmbedding
            # BAAI/bge-small-en-v1.5 is a 384-dimensional, highly accurate embedding model
            _embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
            logger.info("FastEmbed BAAI/bge-small-en-v1.5 model loaded successfully.")
        except Exception as e:
            logger.warning(f"FastEmbed initialization failed: {e}. Falling back to default.")
            _embedding_model = None
    return _embedding_model


class EmbeddingService:
    """Service for generating high-performance dense vector embeddings (384 dimensions)."""

    DIMENSIONS = 384

    @classmethod
    def embed_texts(cls, texts: List[str]) -> List[List[float]]:
        """
        Generates vector embeddings for a list of document chunk texts.
        Returns a list of 384-float vectors.
        """
        if not texts:
            return []

        model = get_embedding_model()
        if model is not None:
            try:
                # fastembed returns generator of numpy arrays
                embeddings_gen = model.embed(texts)
                return [list(vec.tolist() if hasattr(vec, "tolist") else vec) for vec in embeddings_gen]
            except Exception as e:
                logger.error(f"Error computing embeddings with FastEmbed: {e}")

        # Deterministic pseudo-embedding fallback if model cannot load in container environment
        return [cls._fallback_pseudo_embedding(t) for t in texts]

    @classmethod
    def embed_query(cls, query: str) -> List[float]:
        """
        Generates embedding vector for a single search/user query.
        """
        results = cls.embed_texts([query])
        return results[0] if results else [0.0] * cls.DIMENSIONS

    @classmethod
    def _fallback_pseudo_embedding(cls, text: str) -> List[float]:
        """Deterministic pseudo-embedding for testing or offline environments."""
        import hashlib
        import math

        vector = [0.0] * cls.DIMENSIONS
        tokens = text.lower().split()
        if not tokens:
            return vector

        for i, token in enumerate(tokens):
            h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
            idx = h % cls.DIMENSIONS
            vector[idx] += 1.0 / (i + 1.0)

        # Normalize to unit length
        norm = math.sqrt(sum(x * x for x in vector))
        if norm > 0:
            vector = [x / norm for x in vector]

        return vector
