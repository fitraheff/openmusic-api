exports.up = (pgm) => {
    pgm.createTable('user_album_likes', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        userId: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE',
        },
        albumId: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'albums(id)',
            onDelete: 'CASCADE',
        },
    });

    // Menambahkan constraint UNIQUE untuk menghindari duplikasi user_id dan album_id
    pgm.addConstraint('user_album_likes', 'unique_user_album', 'UNIQUE("userId", "albumId")');
};

exports.down = (pgm) => {
    pgm.dropTable('user_album_likes');
};
