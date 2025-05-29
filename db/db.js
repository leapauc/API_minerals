// Create postgresql connection and pool
const  pgsqlPool  = require('pg').Pool;

// Remplacez les valeurs par vos informations de connexion
const db = new pgsqlPool({
  user: 'postgres',
  host: 'localhost',
  database: 'minerals',
  password: '0zaIySyzZro1qeSbe8aQ',
  port: "5432",
  max:10
});

db.connect((err,connection)=> {
    if (err) throw err;
    console.log('Connected to PgSQL DB successfully!');
    connection.release()
})

module.exports = db; 