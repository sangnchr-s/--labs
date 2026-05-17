const sql = require("mssql");

const config = {
  user: "sa",
  password: "Lab16_Strong!",
  server: "127.0.0.1",
  port: 1433,
  database: "GAS",
  pool: { max: 10, min: 0, idleTimeoutMillis: 10000 },
  options: { encrypt: false, trustServerCertificate: true },
};

function connectDB(done) {
  const pool = new sql.ConnectionPool(config);
  pool.connect((err) => {
    if (err) return done(err);
    done(null, pool);
  });
}

function groupPulpitSubjects(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.pulpit; 
    if (!map.has(key)) {  
      map.set(key, {
        pulpit: row.pulpit,
        pulpit_name: row.pulpit_name,
        faculty: row.faculty,
        subjects: [],
      });
    }
    if (row.subject != null) {
      map.get(key).subjects.push({
        subject: row.subject,
        subject_name: row.subject_name,
        pulpit: row.subject_pulpit != null ? row.subject_pulpit : row.pulpit, 
      });
    }
  }
  return [...map.values()]; 
}

const resolver = {
  getFaculties: (args, pool) => {
    const code = args.faculty;
    if (code != null && String(code).trim() !== "") {
      const r = pool.request();
      r.input("faculty", sql.VarChar(20), String(code).trim());
      return r
        .query(
          "SELECT [FACULTY] AS faculty, [FACULTY_NAME] AS faculty_name FROM dbo.FACULTY WHERE [FACULTY] = @faculty"
        )
        .then((q) => q.recordset);
    }
    return pool
      .request()
      .query(
        "SELECT [FACULTY] AS faculty, [FACULTY_NAME] AS faculty_name FROM dbo.FACULTY ORDER BY [FACULTY]"
      )
      .then((q) => q.recordset);
  },


  getTeachers: (args, pool) => {
    const code = args.teacher;
    if (code != null && String(code).trim() !== "") {
      const r = pool.request();
      r.input("teacher", sql.VarChar(20), String(code).trim());
      return r
        .query(
          "SELECT [TEACHER] AS teacher, [TEACHER_NAME] AS teacher_name, [PULPIT] AS pulpit FROM dbo.TEACHER WHERE [TEACHER] = @teacher"
        )
        .then((q) => q.recordset);
    }
    return pool
      .request()
      .query(
        "SELECT [TEACHER] AS teacher, [TEACHER_NAME] AS teacher_name, [PULPIT] AS pulpit FROM dbo.TEACHER ORDER BY [TEACHER]"
      )
      .then((q) => q.recordset);
  },

  getPulpits: (args, pool) => {
    const code = args.pulpit;
    if (code != null && String(code).trim() !== "") {
      const r = pool.request();
      r.input("pulpit", sql.VarChar(20), String(code).trim());
      return r
        .query(
          "SELECT [PULPIT] AS pulpit, [PULPIT_NAME] AS pulpit_name, [FACULTY] AS faculty FROM dbo.PULPIT WHERE [PULPIT] = @pulpit"
        )
        .then((q) => q.recordset);
    }
    return pool
      .request()
      .query(
        "SELECT [PULPIT] AS pulpit, [PULPIT_NAME] AS pulpit_name, [FACULTY] AS faculty FROM dbo.PULPIT ORDER BY [PULPIT]"
      )
      .then((q) => q.recordset);
  },

  getSubjects: (args, pool) => {
    const code = args.subject;
    if (code != null && String(code).trim() !== "") {
      const r = pool.request();
      r.input("subject", sql.VarChar(20), String(code).trim());
      return r
        .query(
          "SELECT [SUBJECT] AS subject, [SUBJECT_NAME] AS subject_name, [PULPIT] AS pulpit FROM dbo.SUBJECT WHERE [SUBJECT] = @subject"
        )
        .then((q) => q.recordset);
    }
    return pool
      .request()
      .query(
        "SELECT [SUBJECT] AS subject, [SUBJECT_NAME] AS subject_name, [PULPIT] AS pulpit FROM dbo.SUBJECT ORDER BY [SUBJECT]"
      )
      .then((q) => q.recordset);
  },
  setFaculty: (args, pool) => {
    const f = args.faculty;
    const code = String(f.faculty).trim();
    const name = String(f.faculty_name).trim();
    if (!code || !name) {
      throw new Error("faculty и faculty_name не должны быть пустыми");
    }
    const r = pool.request();
    r.input("faculty", sql.VarChar(20), code);
    r.input("faculty_name", sql.NVarChar(400), name);
    return r
      .query(
        `IF EXISTS (SELECT 1 FROM dbo.FACULTY WHERE [FACULTY] = @faculty)
           UPDATE dbo.FACULTY SET [FACULTY_NAME] = @faculty_name WHERE [FACULTY] = @faculty;
         ELSE
           INSERT INTO dbo.FACULTY ([FACULTY], [FACULTY_NAME]) VALUES (@faculty, @faculty_name);`
      )

      .then(() => {
        const r2 = pool.request();
        r2.input("faculty", sql.VarChar(20), code);
        return r2.query(
          "SELECT [FACULTY] AS faculty, [FACULTY_NAME] AS faculty_name FROM dbo.FACULTY WHERE [FACULTY] = @faculty"
        );
      })
      .then((q) => {
        if (!q.recordset || !q.recordset.length) {
          throw new Error("Не удалось прочитать факультет после сохранения");
        }
        return q.recordset[0];
      });
  },

  setTeacher: (args, pool) => {
    const t = args.teacher;
    const code = String(t.teacher).trim();
    const name = String(t.teacher_name).trim();
    const pulpit = String(t.pulpit).trim();
    if (!code || !name || !pulpit) {
      throw new Error("teacher, teacher_name и pulpit не должны быть пустыми");
    }
    const r = pool.request();
    r.input("teacher", sql.VarChar(20), code);
    r.input("teacher_name", sql.NVarChar(400), name);
    r.input("pulpit", sql.VarChar(20), pulpit);
    return r
      .query(
        `IF EXISTS (SELECT 1 FROM dbo.TEACHER WHERE [TEACHER] = @teacher)
           UPDATE dbo.TEACHER SET [TEACHER_NAME] = @teacher_name, [PULPIT] = @pulpit WHERE [TEACHER] = @teacher;
         ELSE
           INSERT INTO dbo.TEACHER ([TEACHER], [TEACHER_NAME], [PULPIT]) VALUES (@teacher, @teacher_name, @pulpit);`
      )
      .then(() => {
        const r2 = pool.request();
        r2.input("teacher", sql.VarChar(20), code);
        return r2.query(
          "SELECT [TEACHER] AS teacher, [TEACHER_NAME] AS teacher_name, [PULPIT] AS pulpit FROM dbo.TEACHER WHERE [TEACHER] = @teacher"
        );
      })
      .then((q) => {
        if (!q.recordset || !q.recordset.length) {
          throw new Error("Не удалось прочитать преподавателя после сохранения");
        }
        return q.recordset[0];
      });
  },

  setPulpit: (args, pool) => {
    const p = args.pulpit;
    const code = String(p.pulpit).trim();
    const name = String(p.pulpit_name).trim();
    const faculty = String(p.faculty).trim();
    if (!code || !name || !faculty) {
      throw new Error("pulpit, pulpit_name и faculty не должны быть пустыми");
    }
    const r = pool.request();
    r.input("pulpit", sql.VarChar(20), code);
    r.input("pulpit_name", sql.NVarChar(400), name);
    r.input("faculty", sql.VarChar(20), faculty);
    return r
      .query(
        `IF EXISTS (SELECT 1 FROM dbo.PULPIT WHERE [PULPIT] = @pulpit)
           UPDATE dbo.PULPIT SET [PULPIT_NAME] = @pulpit_name, [FACULTY] = @faculty WHERE [PULPIT] = @pulpit;
         ELSE
           INSERT INTO dbo.PULPIT ([PULPIT], [PULPIT_NAME], [FACULTY]) VALUES (@pulpit, @pulpit_name, @faculty);`
      )
      .then(() => {
        const r2 = pool.request();
        r2.input("pulpit", sql.VarChar(20), code);
        return r2.query(
          "SELECT [PULPIT] AS pulpit, [PULPIT_NAME] AS pulpit_name, [FACULTY] AS faculty FROM dbo.PULPIT WHERE [PULPIT] = @pulpit"
        );
      })
      .then((q) => {
        if (!q.recordset || !q.recordset.length) {
          throw new Error("Не удалось прочитать кафедру после сохранения");
        }
        return q.recordset[0];
      });
  },

  setSubject: (args, pool) => {
    const s = args.subject;
    const code = String(s.subject).trim();
    const name = String(s.subject_name).trim();
    const pulpit = String(s.pulpit).trim();
    if (!code || !name || !pulpit) {
      throw new Error("subject, subject_name и pulpit не должны быть пустыми");
    }
    const r = pool.request();
    r.input("subject", sql.VarChar(20), code);
    r.input("subject_name", sql.NVarChar(400), name);
    r.input("pulpit", sql.VarChar(20), pulpit);
    return r
      .query(
        `IF EXISTS (SELECT 1 FROM dbo.SUBJECT WHERE [SUBJECT] = @subject)
           UPDATE dbo.SUBJECT SET [SUBJECT_NAME] = @subject_name, [PULPIT] = @pulpit WHERE [SUBJECT] = @subject;
         ELSE
           INSERT INTO dbo.SUBJECT ([SUBJECT], [SUBJECT_NAME], [PULPIT]) VALUES (@subject, @subject_name, @pulpit);`
      )
      .then(() => {
        const r2 = pool.request();
        r2.input("subject", sql.VarChar(20), code);
        return r2.query(
          "SELECT [SUBJECT] AS subject, [SUBJECT_NAME] AS subject_name, [PULPIT] AS pulpit FROM dbo.SUBJECT WHERE [SUBJECT] = @subject"
        );
      })
      .then((q) => {
        if (!q.recordset || !q.recordset.length) {
          throw new Error("Не удалось прочитать дисциплину после сохранения");
        }
        return q.recordset[0];
      });
  },

  delFaculty: (args, pool) => {
    const code = String(args.faculty.faculty).trim();
    if (!code) {
      throw new Error("faculty не должен быть пустым");
    }
    const r = pool.request();
    r.input("faculty", sql.VarChar(20), code);
    return r
      .query(
        `IF EXISTS (SELECT 1 FROM dbo.FACULTY WHERE [FACULTY] = @faculty)
         BEGIN
           DELETE FROM dbo.FACULTY WHERE [FACULTY] = @faculty;
           SELECT CAST(1 AS BIT) AS ok; // преобразование одного типа в другой благодяря CAST
         END
         ELSE
           SELECT CAST(0 AS BIT) AS ok;`
      )
      .then((q) => {
        const row = q.recordset && q.recordset[0];
        return !!(row && row.ok);
      });
  },

  delTeacher: (args, pool) => {
    const code = String(args.teacher.teacher).trim();
    if (!code) {
      throw new Error("teacher не должен быть пустым");
    }
    const r = pool.request();
    r.input("teacher", sql.VarChar(20), code);
    return r
      .query(
        `IF EXISTS (SELECT 1 FROM dbo.TEACHER WHERE [TEACHER] = @teacher)
         BEGIN
           DELETE FROM dbo.TEACHER WHERE [TEACHER] = @teacher;
           SELECT CAST(1 AS BIT) AS ok;
         END
         ELSE
           SELECT CAST(0 AS BIT) AS ok;`
      )
      .then((q) => {
        const row = q.recordset && q.recordset[0];
        return !!(row && row.ok);
      });
  },

  delPulpit: (args, pool) => {
    const code = String(args.pulpit.pulpit).trim();
    if (!code) {
      throw new Error("pulpit не должен быть пустым");
    }
    const r = pool.request();
    r.input("pulpit", sql.VarChar(20), code);
    return r
      .query(
        `IF EXISTS (SELECT 1 FROM dbo.PULPIT WHERE [PULPIT] = @pulpit)
         BEGIN
           DELETE FROM dbo.PULPIT WHERE [PULPIT] = @pulpit;
           SELECT CAST(1 AS BIT) AS ok;
         END
         ELSE
           SELECT CAST(0 AS BIT) AS ok;`
      )
      .then((q) => {
        const row = q.recordset && q.recordset[0];
        return !!(row && row.ok);
      });
  },

  delSubject: (args, pool) => {
    const code = String(args.subject.subject).trim();
    if (!code) {
      throw new Error("subject не должен быть пустым");
    }
    const r = pool.request();
    r.input("subject", sql.VarChar(20), code);
    return r
      .query(
        `IF EXISTS (SELECT 1 FROM dbo.SUBJECT WHERE [SUBJECT] = @subject)
         BEGIN
           DELETE FROM dbo.SUBJECT WHERE [SUBJECT] = @subject;
           SELECT CAST(1 AS BIT) AS ok;
         END
         ELSE
           SELECT CAST(0 AS BIT) AS ok;`
      )
      .then((q) => {
        const row = q.recordset && q.recordset[0];
        return !!(row && row.ok);
      });
  },

  getTeachersByFaculty: (args, pool) => {
    const code = String(args.faculty).trim();
    if (!code) {
      throw new Error("faculty не должен быть пустым");
    }
    const r = pool.request();
    r.input("faculty", sql.VarChar(20), code);
    return r
      .query(
        `SELECT t.[TEACHER] AS teacher, t.[TEACHER_NAME] AS teacher_name, t.[PULPIT] AS pulpit
         FROM dbo.TEACHER t
         INNER JOIN dbo.PULPIT p ON p.[PULPIT] = t.[PULPIT]
         WHERE p.[FACULTY] = @faculty
         ORDER BY t.[TEACHER]`
      )
      .then((q) => q.recordset);
  },

  getSubjectsByFaculties: (args, pool) => {
    const code = String(args.faculty).trim();
    if (!code) {
      throw new Error("faculty не должен быть пустым");
    }
    const r = pool.request();
    r.input("faculty", sql.VarChar(20), code);
    return r
      .query(
        `SELECT p.[PULPIT] AS pulpit, p.[PULPIT_NAME] AS pulpit_name, p.[FACULTY] AS faculty,
                s.[SUBJECT] AS subject, s.[SUBJECT_NAME] AS subject_name, s.[PULPIT] AS subject_pulpit
         FROM dbo.PULPIT p
         LEFT JOIN dbo.SUBJECT s ON s.[PULPIT] = p.[PULPIT]
         WHERE p.[FACULTY] = @faculty
         ORDER BY p.[PULPIT], s.[SUBJECT]`
      )
      .then((q) => groupPulpitSubjects(q.recordset));
  },
};

module.exports = { connectDB, resolver };
