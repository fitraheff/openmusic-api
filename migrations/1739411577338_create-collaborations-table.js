/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    // membuat table collaborations
    pgm.createTable('collaborations', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        "playlistId": {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        "userId": {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    });

    /*
    Menambahkan constraint UNIQUE, kombinasi dari kolom note_id dan user_id.
    Guna menghindari duplikasi data antara nilai keduanya.
    */
    pgm.addConstraint('collaborations', 'unique_playlistId_and_userId', 'UNIQUE("playlistId", "userId")');

    // memberikan constraint foreign key pada kolom note_id dan user_id terhadap notes.id dan users.id
    pgm.addConstraint('collaborations', 
    'fk_collaborations.playlistId_playlists.id', 
    'FOREIGN KEY("playlistId") REFERENCES playlists(id) ON DELETE CASCADE');
    pgm.addConstraint('collaborations', 
    'fk_collaborations.userId_users.id', 
    'FOREIGN KEY("userId") REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    // menghapus tabel collaborations
    pgm.dropTable('collaborations');
};