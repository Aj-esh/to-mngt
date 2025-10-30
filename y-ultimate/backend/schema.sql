    -- enum types for users roles, match statuses, and team statuses for data integrity
    CREATE TYPE user_role AS ENUM (
        'Director',
        'Programme Manager',
        'Coach',
        'Team Manager',
        'Player',
        'Volunteer'
    );

    CREATE TYPE match_status AS ENUM (
        'Scheduled',
        'Live',
        'Completed',
        'Cancelled'
    );

    CREATE TYPE team_status AS ENUM (
        'Pending',
        'Approved',
        'Rejected'
    );

    -- Table to store users and roles
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        pwd_hash VARCHAR(255) NOT NULL,
        role user_role NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Central table for all children participating in programs
    CREATE TABLE children (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        date_of_birth DATE,
        gender VARCHAR(100),
        community VARCHAR(15),
        school VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        created_by INT REFERENCES users(id)
    );

    -- table for tournamnents
    CREATE TABLE tournamnents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        location VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        created_by INT REFERENCES users(id)
    );

    -- table for teams
    CREATE TABLE teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        tournamnent_id INT  REFERENCES tournamnents(id) ON DELETE CASCADE,
        manager_id INT REFERENCES users(id),
        status team_status DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        created_by INT REFERENCES users(id)
    );

    -- table for players in teams
    CREATE TABLE team_players (
        team_id INT REFERENCES teams(id) ON DELETE CASCADE,
        player_id INT REFERENCES children(id) ON DELETE CASCADE,
        jersey_number INT,
        PRIMARY KEY (team_id, player_id)
    );

    -- table for matches
    CREATE TABLE matches (
        id SERIAL PRIMARY KEY,
        tournamnent_id INT REFERENCES tournamnents(id) ON DELETE CASCADE,
        team_a INT REFERENCES teams(id),
        team_b INT REFERENCES teams(id),
        match_date TIMESTAMPTZ NOT NULL,
        field_number INT,
        location VARCHAR(255),
        Scheduled_time TIMESTAMPTZ,
        status match_status DEFAULT 'Scheduled',
        score_team_a INT DEFAULT 0,
        score_team_b INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        created_by INT REFERENCES users(id)
    );

    -- spirit scores table after each match
    CREATE TABLE spirit_scores (
        id SERIAL PRIMARY KEY,
        match_id INT REFERENCES matches(id) ON DELETE CASCADE,
        scoring_team_id INT REFERENCES teams(id),
        rated_team_id INT REFERENCES teams(id),
        
        rules_knowledge SMALLINT CHECK (rules_knowledge BETWEEN 1 AND 5),
        fouls_called SMALLINT CHECK (fouls_called BETWEEN 1 AND 5),
        positive_attitude SMALLINT CHECK (positive_attitude BETWEEN 1 AND 5),
        fair_play SMALLINT CHECK (fair_play BETWEEN 1 AND 5),
        communication SMALLINT CHECK (communication BETWEEN 1 AND 5),
        comments TEXT,
        submitted_at TIMESTAMPTZ DEFAULT NOW(),
        submitted_by INT REFERENCES users(id),
        UNIQUE (match_id, scoring_team_id)    
    );

    -- coaching programme sessions table
    CREATE TABLE coaching_sessions (
        id SERIAL PRIMARY KEY,
        session_date TIMESTAMPTZ NOT NULL,
        start_time TIME,
        end_time TIME,
        location VARCHAR(255),
        coach_id INT REFERENCES users(id),
        name VARCHAR(150),
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- attendance tracker for coaching sessions
    CREATE TABLE session_attendance (
        session_id INT REFERENCES coaching_sessions(id) ON DELETE CASCADE,
        child_id INT REFERENCES children(id) ON DELETE CASCADE,
        attended BOOLEAN DEFAULT TRUE,
        came_late BOOLEAN DEFAULT FALSE,
        came_time TIME,
        notes TEXT,
        PRIMARY KEY (session_id, child_id)
    );

    -- LSAS assessment for child
    CREATE TABLE lsas_assessments (
        id SERIAL PRIMARY KEY,
        child_id INT REFERENCES children(id) ON DELETE CASCADE,
        coaching_site VARCHAR(150),
        assessment_date DATE NOT NULL,
        joining_date DATE NOT NULL,
        date_of_birth DATE,
        how_old_looks DATE,
        difficulty_working_in_o_native_language BOOLEAN,
        assessor INT REFERENCES users(id),
        assessment_type VARCHAR(100),
        gender VARCHAR(100),
        agility SMALLINT CHECK (agility BETWEEN 1 AND 10),
        speed SMALLINT CHECK (speed BETWEEN 1 AND 10),
        endurance SMALLINT CHECK (endurance BETWEEN 1 AND 10),
        teamwork SMALLINT CHECK (teamwork BETWEEN 1 AND 10),
        comments TEXT
    );

    -- Home visits tracking.
    CREATE TABLE home_visits (
        id SERIAL PRIMARY KEY,
        child_id INT REFERENCES children(id) ON DELETE CASCADE,
        visited_by INT REFERENCES users(id),
        visit_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
