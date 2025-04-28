      
 SELECT
  datetime,
  close
FROM company_intraday_data
WHERE symbol    = ?
  AND datetime >= ?
  AND datetime <= ?
ORDER BY datetime ASC;