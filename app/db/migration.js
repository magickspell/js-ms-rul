export function initMigrate(db) {
  const query = `SELECT * FROM users WHERE 1=1`;
  db.query(query, [], (err) => {
    if (err) {
      db.query(
        `
          CREATE TABLE users (
              id INTEGER PRIMARY KEY AUTO_INCREMENT,
              full_name VARCHAR(100) NOT NULL,
              role VARCHAR(100) NOT NULL,
              efficiency INTEGER NOT NULL DEFAULT 0
          );
        `, [], (err) => {
          if (err) {
            console.info(`Migration failed ${err.message}`);
          } else {
            console.info(`Migration complete (create table)`);
          }
        }
      );
      db.query(
        `
          INSERT INTO users (full_name, role, efficiency) VALUES
            ('Иван Иванов', 'Разработчик', FLOOR(RAND() * 100)),
            ('Мария Петрова', 'Аналитик', FLOOR(RAND() * 100)),
            ('Алексей Сидоров', 'Менеджер', FLOOR(RAND() * 100)),
            ('Ольга Кузнецова', 'Тестировщик', FLOOR(RAND() * 100)),
            ('Дмитрий Смирнов', 'Дизайнер', FLOOR(RAND() * 100)),
            ('Елена Васильева', 'Разработчик', FLOOR(RAND() * 100)),
            ('Сергей Павлов', 'Аналитик', FLOOR(RAND() * 100)),
            ('Анна Козлова', 'Менеджер', FLOOR(RAND() * 100)),
            ('Павел Новиков', 'Тестировщик', FLOOR(RAND() * 100)),
            ('Татьяна Морозова', 'Дизайнер', FLOOR(RAND() * 100)),
            ('Александр Белов', 'Разработчик', FLOOR(RAND() * 100)),
            ('Наталья Воробьева', 'Аналитик', FLOOR(RAND() * 100))
          ;
        `, [], (err) => {
          if (err) {
            console.info(`Migration failed ${err.message}`);
          } else {
            console.info(`Migration complete (insert into table)`);
          }
        }
      );
    }
  });
}