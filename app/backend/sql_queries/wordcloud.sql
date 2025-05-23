--  the mosfrequent words from the new articles, lets work on the sql query first. Create a SQL query to extract the most frequent words from the summary field of news_articles for a given symbol and date range.
-- Generate a list of stop words for me

-- Now I want to have a score per word, based on the sentiment of the articles where the word appears. The score should be calculated as follows:
--Resonse
--
--avg_sentiment_score: The average ticker sentiment score of all articles where the word appears.
--total_sentiment_score: The sum of all sentiment scores from articles where the word appears.
--weighted_sentiment_score: A score that considers both sentiment and frequency, giving more importance to words that appear more often. The logarithmic scaling prevents very common words from dominating completely.


	

WITH articles AS (
    SELECT 
        na.summary,
        nts.ticker_sentiment_score
    FROM news_articles na
    JOIN news_ticker_sentiment nts ON nts.article_id = na.id
    WHERE nts.ticker_symbol = ?
    AND na.time_published BETWEEN ? AND ?
    AND na.summary IS NOT NULL
),
split_words AS (
    -- first word
    SELECT
        LOWER(
            TRIM(
                SUBSTR(
                    summary,
                    pos,
                    CASE
                        WHEN INSTR(SUBSTR(summary || ' ', pos), ' ') = 0 THEN LENGTH(summary) - pos + 1
                        ELSE INSTR(SUBSTR(summary || ' ', pos), ' ') - 1
                    END
                ),
                '.,;:!?()"'
            )
        ) AS word,
        summary,
        ticker_sentiment_score,
        pos + CASE
            WHEN INSTR(SUBSTR(summary || ' ', pos), ' ') = 0 THEN LENGTH(summary) - pos + 2
            ELSE INSTR(SUBSTR(summary || ' ', pos), ' ')
        END AS next_pos
    FROM articles, (SELECT 1 AS pos)
    WHERE LENGTH(summary) > 0

    UNION ALL

    -- subsequent words
    SELECT
        LOWER(
            TRIM(
                SUBSTR(
                    summary,
                    next_pos,
                    CASE
                        WHEN INSTR(SUBSTR(summary || ' ', next_pos), ' ') = 0 THEN LENGTH(summary) - next_pos + 1
                        ELSE INSTR(SUBSTR(summary || ' ', next_pos), ' ') - 1
                    END
                ),
                '.,;:!?()"'
            )
        ) AS word,
        summary,
        ticker_sentiment_score,
        next_pos + CASE
            WHEN INSTR(SUBSTR(summary || ' ', next_pos), ' ') = 0 THEN LENGTH(summary) - next_pos + 2
            ELSE INSTR(SUBSTR(summary || ' ', next_pos), ' ')
        END AS next_pos
    FROM split_words
    WHERE next_pos <= LENGTH(summary)
)
SELECT
    word,
    COUNT(*) AS occurrence_count,
    AVG(ticker_sentiment_score) AS avg_sentiment_score,
    -- Weighted sentiment score (more occurrences = more weight)
    SUM(ticker_sentiment_score) / COUNT(*) * LN(COUNT(*) + 1) AS weighted_sentiment_score
FROM split_words
WHERE word != ''
AND LENGTH(word) > 2
AND word NOT IN (
    'the','and','for','with','that','are','was','but','not','you',
    'all','can','has','have','had','this','from','they','will','his',
    'her','she','him','our','out','who','their','about','which','one',
    'when','were','there','been','more','would','what','your','than',
    'how','its','may','also','into','other','some','any','new','use',
    'used','using','such','these','those','over','most','after','before',
    'where','while','each','many','much','very','just','like','get','got',
    'see','did','does','had','then','now','off','per','via','etc'
)
GROUP BY word
ORDER BY occurrence_count DESC
LIMIT ?;






-- Non score one
-- WITH articles AS (
--   SELECT na.summary
--   FROM news_articles na
--   JOIN news_ticker_sentiment nts ON nts.article_id = na.id
--   WHERE nts.ticker_symbol = ?
--     AND na.time_published BETWEEN ? AND ?
--     AND na.summary IS NOT NULL
-- ),
-- split_words AS (
--   -- first word
--   SELECT
--     LOWER(
--       TRIM(
--         SUBSTR(
--           summary,
--           pos,
--           CASE
--             WHEN INSTR(SUBSTR(summary || ' ', pos), ' ') = 0 THEN LENGTH(summary) - pos + 1
--             ELSE INSTR(SUBSTR(summary || ' ', pos), ' ') - 1
--           END
--         ),
--         '.,;:!?()"'
--       )
--     ) AS word,
--     summary,
--     pos + CASE
--       WHEN INSTR(SUBSTR(summary || ' ', pos), ' ') = 0 THEN LENGTH(summary) - pos + 2
--       ELSE INSTR(SUBSTR(summary || ' ', pos), ' ')
--     END AS next_pos
--   FROM articles, (SELECT 1 AS pos)
--   WHERE LENGTH(summary) > 0

--   UNION ALL

--   -- subsequent words
--   SELECT
--     LOWER(
--       TRIM(
--         SUBSTR(
--           summary,
--           next_pos,
--           CASE
--             WHEN INSTR(SUBSTR(summary || ' ', next_pos), ' ') = 0 THEN LENGTH(summary) - next_pos + 1
--             ELSE INSTR(SUBSTR(summary || ' ', next_pos), ' ') - 1
--           END
--         ),
--         '.,;:!?()"'
--       )
--     ) AS word,
--     summary,
--     next_pos + CASE
--       WHEN INSTR(SUBSTR(summary || ' ', next_pos), ' ') = 0 THEN LENGTH(summary) - next_pos + 2
--       ELSE INSTR(SUBSTR(summary || ' ', next_pos), ' ')
--     END AS next_pos
--   FROM split_words
--   WHERE next_pos <= LENGTH(summary)
-- )
-- SELECT
--   word,
--   COUNT(*) AS count
-- FROM split_words
-- WHERE word != ''
--   AND LENGTH(word) > 2
--   AND word NOT IN (
--     'the','and','for','with','that','are','was','but','not','you',
--     'all','can','has','have','had','this','from','they','will','his',
--     'her','she','him','our','out','who','their','about','which','one',
--     'when','were','there','been','more','would','what','your','than',
--     'how','its','may','also','into','other','some','any','new','use',
--     'used','using','such','these','those','over','most','after','before',
--     'where','while','each','many','much','very','just','like','get','got',
--     'see','did','does','had','then','now','off','per','via','etc'
--   )
-- GROUP BY word
-- ORDER BY count DESC
-- LIMIT ?;
