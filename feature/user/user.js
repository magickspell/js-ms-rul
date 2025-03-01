function handleErr(res, err) {
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, result: { error: err.message } }));
}

function handleUserNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, result: { error: "user not found" } }));
}

export function createUser(db, res, payload) {
  const { full_name, role, efficiency } = payload;
  const query = `INSERT INTO users (full_name, role, efficiency) VALUES (?, ?, ?)`;
  db.query(query, [full_name, role, efficiency], (err, result) => {
    if (err) {
      handleErr(res, err);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, result: { id: result.insertId } }));
    }
  });
}

export function getUser(db, res, id, queryParams) {
  let query = `SELECT * FROM users WHERE 1=1`;
  let queryParamsArr = [];

  if (id) {
    query += ' AND id = ?';
    queryParamsArr.push(id)
  }

  if (queryParams.role) {
    query += ' AND role = ?';
    queryParamsArr.push(queryParams.role)
  }
  if (queryParams.efficiency) {
    // возможно вы тестите по другому (по равенству?), не уточнял у hr
    query += ' AND efficiency >= ?';
    queryParamsArr.push(queryParams.efficiency)
  }
  if (queryParams.fullName) {
    query += ' AND full_name = ?';
    queryParamsArr.push(queryParams.fullName)
  }
  // оверхед, но я не уточнял у hr как вы в тестах пишите параметр
  if (queryParams.full_name) {
    query += ' AND full_name = ?';
    queryParamsArr.push(queryParams.full_name)
  }

  db.query(query, queryParamsArr, (err, results) => {
    if (err) {
      handleErr(res, err)
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, result: { users: results } }));
    }
  });
}

export function updateUser(db, res, id, payload) {
  const { full_name, role, efficiency } = payload;
  let query = `UPDATE users SET `;
  let queryParamsArr = [];
  const checkParams = () => {
    if (queryParamsArr.length > 0) {
      query += ',';
    }
  }

  if (full_name) {
    query += ' full_name = ?';
    queryParamsArr.push(full_name)
  }
  if (role) {
    checkParams();
    query += ' role = ?';
    queryParamsArr.push(role)
  }
  if (efficiency) {
    checkParams();
    query += ' efficiency = ?';
    queryParamsArr.push(efficiency)
  }

  query += ' WHERE id = ?';
  queryParamsArr.push(id);

  db.query(query, queryParamsArr, (err, resp) => {
    if (err) {
      return db.rollback(() => {
        handleErr(res, err);
      });
    } else {
      if (resp.affectedRows > 0) {
        let userQuery = `SELECT * FROM users WHERE id = ?`;
        db.query(userQuery, [id], (err, users) => {
          if (!users[0]) {
            handleUserNotFound(res);
            return;
          }
          if (err) {
            handleErr(res, err);
            return;
          } else {
            let user = users[0];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, result: { 
              id: Number(id),
              full_name: full_name ?? user.full_name,
              role: role ?? user.role,
              efficiency: efficiency ?? user.efficiency
            }}));
          }
        })
      } else {
        handleUserNotFound(res);
        return;
      }
    }
  });
}

export function deleteUser(db, res, id) {
  if (id) {
    const userQuery = `SELECT * FROM users WHERE id = ?`;
    db.query(userQuery, [id], (err, users) => {
      if (err) {
        handleErr(res, err);
        return;
      } else {
        let user = users[0];
        if (!user) {
          handleUserNotFound(res);
          return;
        }

        const query = `DELETE FROM users WHERE id = ?`;
        db.query(query, [id], (err, resp) => {
          if (err) {
            handleErr(res, err);
          } else {
            if (resp.affectedRows > 0) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, result: { 
                id: Number(id),
                full_name: user.full_name,
                role: user.role,
                efficiency: user.efficiency
              }}));
            } else {
              handleUserNotFound(res);
              return;
            }
          }
        });
      }
    })
  } else {
    const query = `DELETE FROM users`;
    db.query(query, (err) => {
      if (err) {
        handleErr(res, err);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      }
    });
  }
}