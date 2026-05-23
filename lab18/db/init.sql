IF DB_ID(N'GAS') IS NULL
BEGIN
    CREATE DATABASE GAS;
END
GO

USE GAS;
GO

IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = N'gas_user')
BEGIN
    CREATE LOGIN gas_user WITH PASSWORD = N'GasPass!2026', CHECK_POLICY = OFF;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'gas_user')
BEGIN
    CREATE USER gas_user FOR LOGIN gas_user;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.database_role_members drm
    JOIN sys.database_principals role_principal
        ON drm.role_principal_id = role_principal.principal_id
    JOIN sys.database_principals member_principal
        ON drm.member_principal_id = member_principal.principal_id
    WHERE role_principal.name = N'db_datareader'
        AND member_principal.name = N'gas_user'
)
BEGIN
    ALTER ROLE db_datareader ADD MEMBER gas_user;
END

IF NOT EXISTS (
    SELECT 1
    FROM sys.database_role_members drm
    JOIN sys.database_principals role_principal
        ON drm.role_principal_id = role_principal.principal_id
    JOIN sys.database_principals member_principal
        ON drm.member_principal_id = member_principal.principal_id
    WHERE role_principal.name = N'db_datawriter'
        AND member_principal.name = N'gas_user'
)
BEGIN
    ALTER ROLE db_datawriter ADD MEMBER gas_user;
END
GO

IF OBJECT_ID(N'dbo.FACULTY', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.FACULTY (
        FACULTY NVARCHAR(10) NOT NULL CONSTRAINT PK_FACULTY PRIMARY KEY,
        FACULTY_NAME NVARCHAR(100) NOT NULL
    );
END
GO

IF OBJECT_ID(N'dbo.PULPIT', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PULPIT (
        PULPIT NVARCHAR(10) NOT NULL CONSTRAINT PK_PULPIT PRIMARY KEY,
        PULPIT_NAME NVARCHAR(100) NOT NULL,
        FACULTY NVARCHAR(10) NOT NULL,
        CONSTRAINT FK_PULPIT_FACULTY FOREIGN KEY (FACULTY)
            REFERENCES dbo.FACULTY(FACULTY)
    );
END
GO

IF OBJECT_ID(N'dbo.TEACHER', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TEACHER (
        TEACHER NVARCHAR(10) NOT NULL CONSTRAINT PK_TEACHER PRIMARY KEY,
        TEACHER_NAME NVARCHAR(100) NOT NULL,
        PULPIT NVARCHAR(10) NOT NULL,
        CONSTRAINT FK_TEACHER_PULPIT FOREIGN KEY (PULPIT)
            REFERENCES dbo.PULPIT(PULPIT)
    );
END
GO

IF OBJECT_ID(N'dbo.SUBJECT', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SUBJECT (
        SUBJECT NVARCHAR(10) NOT NULL CONSTRAINT PK_SUBJECT PRIMARY KEY,
        SUBJECT_NAME NVARCHAR(100) NOT NULL,
        PULPIT NVARCHAR(10) NOT NULL,
        CONSTRAINT FK_SUBJECT_PULPIT FOREIGN KEY (PULPIT)
            REFERENCES dbo.PULPIT(PULPIT)
    );
END
GO

IF OBJECT_ID(N'dbo.AUDITORIUM_TYPE', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AUDITORIUM_TYPE (
        AUDITORIUM_TYPE NVARCHAR(10) NOT NULL CONSTRAINT PK_AUDITORIUM_TYPE PRIMARY KEY,
        AUDITORIUM_TYPENAME NVARCHAR(100) NOT NULL
    );
END
GO

IF OBJECT_ID(N'dbo.AUDITORIUM', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AUDITORIUM (
        AUDITORIUM NVARCHAR(10) NOT NULL CONSTRAINT PK_AUDITORIUM PRIMARY KEY,
        AUDITORIUM_NAME NVARCHAR(100) NOT NULL,
        AUDITORIUM_CAPACITY INT NOT NULL,
        AUDITORIUM_TYPE NVARCHAR(10) NOT NULL,
        CONSTRAINT FK_AUDITORIUM_AUDITORIUM_TYPE FOREIGN KEY (AUDITORIUM_TYPE)
            REFERENCES dbo.AUDITORIUM_TYPE(AUDITORIUM_TYPE)
    );
END
GO

MERGE dbo.FACULTY AS target
USING (VALUES
    (N'ФИТ', N'Факультет информационных технологий'),
    (N'ИДиП', N'Издательское дело и полиграфия'),
    (N'ИЭФ', N'Инженерно-экономический факультет'),
    (N'ЛХФ', N'Лесохозяйственный факультет'),
    (N'ТОВ', N'Технология органических веществ'),
    (N'ТТЛП', N'Технология и техника лесной промышленности'),
    (N'ХТиТ', N'Химическая технология и техника')
) AS source (FACULTY, FACULTY_NAME)
ON target.FACULTY = source.FACULTY
WHEN MATCHED THEN
    UPDATE SET FACULTY_NAME = source.FACULTY_NAME
WHEN NOT MATCHED THEN
    INSERT (FACULTY, FACULTY_NAME)
    VALUES (source.FACULTY, source.FACULTY_NAME);
GO

MERGE dbo.PULPIT AS target
USING (VALUES
    (N'ИСиТ', N'Информационные системы и технологии', N'ФИТ'),
    (N'ПИ', N'Программная инженерия', N'ФИТ'),
    (N'ЭВМ', N'Электронные вычислительные машины', N'ЛХФ'),
    (N'САПР', N'Системы автоматизированного проектирования', N'ТОВ'),
    (N'ВМ', N'Высшая математика', N'ТТЛП'),
    (N'ФИЗ', N'Физика', N'ХТиТ')
) AS source (PULPIT, PULPIT_NAME, FACULTY)
ON target.PULPIT = source.PULPIT
WHEN MATCHED THEN
    UPDATE SET PULPIT_NAME = source.PULPIT_NAME, FACULTY = source.FACULTY
WHEN NOT MATCHED THEN
    INSERT (PULPIT, PULPIT_NAME, FACULTY)
    VALUES (source.PULPIT, source.PULPIT_NAME, source.FACULTY);
GO

DELETE FROM dbo.FACULTY
WHERE FACULTY NOT IN (N'ФИТ', N'ИДиП', N'ИЭФ', N'ЛХФ', N'ТОВ', N'ТТЛП', N'ХТиТ');
GO

MERGE dbo.TEACHER AS target
USING (VALUES
    (N'T01', N'Иванов Иван Иванович', N'ИСиТ'),
    (N'T02', N'Петров Петр Петрович', N'ПИ'),
    (N'T03', N'Сидорова Анна Сергеевна', N'ЭВМ'),
    (N'T04', N'Кузнецов Олег Андреевич', N'САПР'),
    (N'T05', N'Смирнова Мария Игоревна', N'ВМ'),
    (N'T06', N'Васильев Дмитрий Олегович', N'ФИЗ')
) AS source (TEACHER, TEACHER_NAME, PULPIT)
ON target.TEACHER = source.TEACHER
WHEN MATCHED THEN
    UPDATE SET TEACHER_NAME = source.TEACHER_NAME, PULPIT = source.PULPIT
WHEN NOT MATCHED THEN
    INSERT (TEACHER, TEACHER_NAME, PULPIT)
    VALUES (source.TEACHER, source.TEACHER_NAME, source.PULPIT);
GO

MERGE dbo.SUBJECT AS target
USING (VALUES
    (N'DB', N'Базы данных', N'ИСиТ'),
    (N'JS', N'Программирование JavaScript', N'ПИ'),
    (N'MAT', N'Материаловедение', N'ЭВМ'),
    (N'ACC', N'Бухгалтерский учет', N'САПР'),
    (N'LA', N'Линейная алгебра', N'ВМ'),
    (N'PHY', N'Физика', N'ФИЗ')
) AS source (SUBJECT, SUBJECT_NAME, PULPIT)
ON target.SUBJECT = source.SUBJECT
WHEN MATCHED THEN
    UPDATE SET SUBJECT_NAME = source.SUBJECT_NAME, PULPIT = source.PULPIT
WHEN NOT MATCHED THEN
    INSERT (SUBJECT, SUBJECT_NAME, PULPIT)
    VALUES (source.SUBJECT, source.SUBJECT_NAME, source.PULPIT);
GO

DELETE FROM dbo.SUBJECT
WHERE SUBJECT NOT IN (N'DB', N'JS', N'MAT', N'ACC', N'LA', N'PHY');
GO

DELETE FROM dbo.PULPIT
WHERE PULPIT NOT IN (N'ИСиТ', N'ПИ', N'ЭВМ', N'САПР', N'ВМ', N'ФИЗ');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM_TYPE WHERE AUDITORIUM_TYPE = N'LECT')
    INSERT INTO dbo.AUDITORIUM_TYPE (AUDITORIUM_TYPE, AUDITORIUM_TYPENAME) VALUES (N'LECT', N'Лекционная аудитория');
IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM_TYPE WHERE AUDITORIUM_TYPE = N'LAB')
    INSERT INTO dbo.AUDITORIUM_TYPE (AUDITORIUM_TYPE, AUDITORIUM_TYPENAME) VALUES (N'LAB', N'Компьютерная лаборатория');
IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM_TYPE WHERE AUDITORIUM_TYPE = N'SEM')
    INSERT INTO dbo.AUDITORIUM_TYPE (AUDITORIUM_TYPE, AUDITORIUM_TYPENAME) VALUES (N'SEM', N'Семинарская аудитория');
IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM_TYPE WHERE AUDITORIUM_TYPE = N'CONF')
    INSERT INTO dbo.AUDITORIUM_TYPE (AUDITORIUM_TYPE, AUDITORIUM_TYPENAME) VALUES (N'CONF', N'Конференц-зал');
IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM_TYPE WHERE AUDITORIUM_TYPE = N'PHYS')
    INSERT INTO dbo.AUDITORIUM_TYPE (AUDITORIUM_TYPE, AUDITORIUM_TYPENAME) VALUES (N'PHYS', N'Физическая лаборатория');
IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM_TYPE WHERE AUDITORIUM_TYPE = N'CHEM')
    INSERT INTO dbo.AUDITORIUM_TYPE (AUDITORIUM_TYPE, AUDITORIUM_TYPENAME) VALUES (N'CHEM', N'Химическая лаборатория');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM WHERE AUDITORIUM = N'101')
    INSERT INTO dbo.AUDITORIUM (AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE) VALUES (N'101', N'Аудитория 101', 80, N'LECT');
IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM WHERE AUDITORIUM = N'102')
    INSERT INTO dbo.AUDITORIUM (AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE) VALUES (N'102', N'Компьютерный класс 102', 25, N'LAB');
IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM WHERE AUDITORIUM = N'203')
    INSERT INTO dbo.AUDITORIUM (AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE) VALUES (N'203', N'Семинарская аудитория 203', 35, N'SEM');
IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM WHERE AUDITORIUM = N'301')
    INSERT INTO dbo.AUDITORIUM (AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE) VALUES (N'301', N'Конференц-зал 301', 120, N'CONF');
IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM WHERE AUDITORIUM = N'405')
    INSERT INTO dbo.AUDITORIUM (AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE) VALUES (N'405', N'Физическая лаборатория 405', 20, N'PHYS');
IF NOT EXISTS (SELECT 1 FROM dbo.AUDITORIUM WHERE AUDITORIUM = N'406')
    INSERT INTO dbo.AUDITORIUM (AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE) VALUES (N'406', N'Химическая лаборатория 406', 18, N'CHEM');
GO
