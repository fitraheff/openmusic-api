exports.shorthands = undefined;


exports.up = (pgm) => {
    pgm.createTable('playlist_activities', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlistId: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'playlists(id)',
            onDelete: 'CASCADE',
        },
        songId: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'songs(id)',
            onDelete: 'CASCADE',
        },
        userId: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE',
        },
        action: {
            type: 'VARCHAR(50)', 
            notNull: true,
        },
        time: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        }
    })

    pgm.sql(`
        ALTER TABLE playlist_activities
        ALTER COLUMN songId DROP NOT NULL;
    `);
};


exports.down = (pgm) => {
    pgm.dropTable('playlist_activities');
};
