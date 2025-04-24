SELECT
  AVG(nts.ticker_sentiment_score) AS "value"
FROM
  news_ticker_sentiment nts
JOIN
  news_articles na
ON
  nts.article_id = na.id
WHERE
  nts.ticker_symbol = ?
  AND na.time_published BETWEEN ? AND ?
;
