// db 연결
const db = require('../../../config/db');
const conn = db.init();
const dayjs = require('dayjs');

exports.list = (req, res) => {
  const { start_date, end_date, page, limit } = req.query;
  console.log(req.query);

  const startDate = dayjs(start_date)
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .format('YYYY-MM-DD HH:mm:ss');

  const endDate = dayjs(end_date)
    .set('hour', 23)
    .set('minute', 59)
    .set('second', 59)
    .format('YYYY-MM-DD HH:mm:ss');

  const pageValue = page ? parseInt(page) : 1;
  const pageSizeValue = limit ? parseInt(limit) : 1000;
  const offset = (pageValue - 1) * pageSizeValue;

  // where 조건
  let baseWhere = `WHERE 1=1`;
  const queryValues = [];

  if (startDate) {
    baseWhere += ` AND CP.created_at >= ?`;
    queryValues.push(startDate);
  }
  if (endDate) {
    baseWhere += ` AND CP.created_at <= ?`;
    queryValues.push(endDate);
  }

  // Count 쿼리 (수정됨)
  const sqlCount = `
    SELECT COUNT(*) AS totalCount
    FROM tbl_customer_point AS CP
    JOIN tbl_customer AS C ON C.id = CP.customer_id
    ${baseWhere}
  `;

  // 데이터 조회 쿼리
  const sql = `
    SELECT
      C.id AS customer_id,
      DATE_FORMAT(CP.created_at, '%Y-%m-%d %H:%i') AS created_at,
      C.nickname,
      C.phone_number,
      CP.point,
      CASE CP.cause
        WHEN 'REWARD' THEN '적립'
        WHEN 'USE' THEN '사용'
        WHEN 'REWARDCANCEL' THEN '적립취소'
        WHEN 'REFUND' THEN '환불'
        WHEN 'BUY' THEN '충전'
        WHEN 'BUYCANCEL' THEN '충전 취소'
        WHEN 'EVENT' THEN '이벤트'
        WHEN 'EXPIRED' THEN '만료'
        WHEN 'SEND' THEN '선물하기'
        WHEN 'RECEIVE' THEN '선물받기'
        ELSE '모름'
      END AS type,
      CP.point_comment,
      CP.is_expire,
      CP.order_id
    FROM tbl_customer_point AS CP
    JOIN tbl_customer AS C ON C.id = CP.customer_id
    ${baseWhere}
    ORDER BY CP.created_at DESC
    LIMIT ? OFFSET ?
  `;

  // count 쿼리 실행
  conn.query(sqlCount, queryValues, (err, countResult) => {
    if (err) {
      return res.status(403).send({
        success: false,
        msg: '다시 시도해주세요.',
      });
    }

    const totalCount = countResult[0].totalCount;

    const paginatedValues = [...queryValues, pageSizeValue, offset];

    // 데이터 조회 쿼리 실행
    conn.query(sql, paginatedValues, (err, rows) => {
      if (err) {
        return res.status(500).send({
          success: false,
          msg: '데이터를 가져오는 데 실패했습니다.',
        });
      }

      return res.status(200).send({
        success: true,
        datas: rows,
        total_records: totalCount,
        per_page: pageSizeValue,
        current_page: pageValue,
      });
    });
  });
};
