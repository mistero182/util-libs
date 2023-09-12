// RDS Lib ver: 0.1.0

export const arrayToMultipleInsert = (data) => {
  const { payload, tableName } = data

  const arrayFromObject = payload.map((item) => {
    return Object.entries(item).map(([prop, valor]) => {
      if (prop === 'location') {
        return Object.entries(valor).map(([key, valor2]) => [`${prop}_${key}`, valor2])
      }

      if (prop === 'payment_meta') {
        return Object.entries(valor).map(([key, valor2]) => [`${prop}_${key}`, valor2])
      }

      return [[ prop, valor]]
    }).flat()
  })

  const keys = arrayFromObject[0].map((item) => item[0])

  const values = arrayFromObject.map((row) => {      
    return row.map((item) => {
      if (item[1] === null)
        return 'NULL'

      if (typeof item[1] === 'string')
        return `'${item[1].replace(/'/g, "''")}'`  //.replace(/'/g, "\\'")

      // Assmung all arrays are of strings
      if(Array.isArray(item[1])) {
        return `ARRAY [ '${item[1].join("','")}' ]`
      }

      return item[1]
    })
  })
  
  let query = `INSERT INTO ${tableName} (${keys.join(', ')})\n` // (${values.join(', ')})
  query += `VALUES (${values.map((row) =>  (row.join(','))  ).join('),\n (')})`
  query += ` ON CONFLICT DO NOTHING`

  return query;
}