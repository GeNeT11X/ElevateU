import os
import re
import math

import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer


class Recommender:
    """Content-based course recommender.

    Builds a TF-IDF representation of every course in the Coursera dataset using
    the course title, the skills it teaches and its description, then ranks
    courses for an arbitrary free-text query (a single skill, a job title or a
    comma separated list of skills) by cosine similarity.

    This is a genuine content-based model: the query is projected into the same
    TF-IDF vector space as the catalogue, so semantically related courses surface
    even when the query words do not appear in the course title.
    """

    # How strongly each field contributes to a course's vector. Skills and the
    # title are the strongest signal of what a course is *about*; the description
    # adds recall.
    _TITLE_WEIGHT = 3
    _SKILLS_WEIGHT = 3
    _DESCRIPTION_WEIGHT = 1

    def __init__(self):
        assets_path = os.path.join(os.path.dirname(__file__), 'assets')
        csv_path = os.path.join(assets_path, 'Coursera.csv')

        # The dataset contains a few non-utf8 characters; latin-1 never fails.
        self.df = pd.read_csv(csv_path, encoding='latin-1')

        # Normalise the columns we rely on and drop duplicate courses so the same
        # title cannot occupy several recommendation slots.
        for col in ('course_name', 'skills', 'description', 'course_url',
                    'university', 'difficulty_level', 'course_rating'):
            if col not in self.df.columns:
                self.df[col] = ''
        self.df = self.df.fillna('')
        self.df = self.df.drop_duplicates(subset='course_name').reset_index(drop=True)

        # Pre-compute a numeric rating used for tie-breaking / quality ranking.
        self.df['rating_value'] = self.df['course_rating'].apply(self._parse_rating)

        # Build the weighted corpus and fit the vectoriser once at start-up.
        corpus = (
            (self.df['course_name'] + ' ') * self._TITLE_WEIGHT
            + (self.df['skills'] + ' ') * self._SKILLS_WEIGHT
            + (self.df['description'] + ' ') * self._DESCRIPTION_WEIGHT
        )

        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=40000,
            sublinear_tf=True,
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    @staticmethod
    def _parse_rating(value):
        """Best-effort conversion of the rating column to a float in [0, 5]."""
        try:
            rating = float(str(value).strip())
        except (TypeError, ValueError):
            return 0.0
        if math.isnan(rating):
            return 0.0
        return max(0.0, min(5.0, rating))

    def _score(self, query: str):
        """Return the cosine similarity of ``query`` against every course."""
        query = (query or '').strip()
        if not query:
            return None
        query_vector = self.vectorizer.transform([query])
        # cosine_similarity returns a 1 x n_courses matrix; flatten to 1-D.
        return cosine_similarity(query_vector, self.tfidf_matrix)[0]

    def recommend(self, course_name: str) -> list:
        """Recommend courses similar to ``course_name`` (legacy interface).

        Kept backwards compatible with the original web app: returns a list of
        ``(title, {'url': ..., 'similarity': ...})`` tuples sorted by similarity.
        """
        scores = self._score(course_name)
        if scores is None:
            return []

        ranked = scores.argsort()[::-1]
        recommended = {}
        for idx in ranked:
            similarity = round(float(scores[idx]), 2)
            if similarity < 0.10:
                break
            name = self.df.iloc[idx]['course_name']
            if name in recommended:
                continue
            recommended[name] = {
                'url': self.df.iloc[idx]['course_url'],
                'similarity': similarity,
            }
            if len(recommended) >= 10:
                break
        return list(recommended.items())

    def recommend_courses(self, skills, top_n: int = 12,
                          min_similarity: float = 0.05) -> list:
        """Recommend courses for a candidate's skill set (rich interface).

        Args:
            skills: a single skill string or an iterable of skills.
            top_n: maximum number of courses to return.
            min_similarity: discard courses below this cosine similarity.

        Returns:
            A list of course dictionaries ordered by relevance, each containing
            metadata suitable for direct display in the UI.
        """
        if isinstance(skills, str):
            skill_list = [s.strip() for s in skills.split(',') if s.strip()]
        else:
            skill_list = [str(s).strip() for s in (skills or []) if str(s).strip()]

        if not skill_list:
            return []

        query = ' '.join(skill_list)
        scores = self._score(query)
        if scores is None:
            return []

        # Blend semantic relevance with course quality so that, among similarly
        # relevant courses, better rated ones rank higher. Relevance dominates;
        # rating only nudges the order (up to ~+5% for a perfect 5.0 course).
        ranking_scores = scores * (1.0 + 0.01 * self.df['rating_value'].to_numpy())
        ranked = ranking_scores.argsort()[::-1]

        # Normalise displayed match score relative to the best candidate so the
        # UI shows an intuitive relevance scale (raw cosine values are small for
        # short queries). The exact cosine value is preserved in `similarity`.
        top_similarity = float(scores[ranked[0]]) if len(ranked) else 0.0

        results = []
        for idx in ranked:
            similarity = float(scores[idx])
            if similarity < min_similarity:
                break

            normalized = (similarity / top_similarity) if top_similarity else 0.0
            match_score = round(min(99.0, 50.0 + normalized * 49.0))

            row = self.df.iloc[idx]
            course_skills_text = str(row['skills']).lower()
            matched = [s for s in skill_list
                       if s.lower() in course_skills_text
                       or s.lower() in str(row['course_name']).lower()]

            results.append({
                'title': row['course_name'],
                'platform': 'Coursera',
                'provider': 'Coursera',
                'url': row['course_url'],
                'similarity': round(similarity, 3),
                'match_score': match_score,
                'university': row['university'],
                'difficulty_level': row['difficulty_level'] or 'All Levels',
                'rating': row['rating_value'] or None,
                'category': matched[0] if matched else skill_list[0],
                'matched_skills': matched,
                'skills': [s for s in re.split(r'\s{2,}|,', str(row['skills']))
                           if s.strip()][:8],
                'image': None,
            })

            if len(results) >= top_n:
                break

        return results
