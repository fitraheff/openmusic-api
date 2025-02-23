exports.up = (pgm) => {
    pgm.createTable('playlist_songs', {
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
    })
};


exports.down = (pgm) => {
    pgm.dropTable('playlist_songs');
};
