exports.shorthands = undefined;

exports.up = (pgm) => {
    // Menambahkan kolom created_at dengan nilai default current_timestamp
    pgm.addColumn('playlists', {
        created_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Menambahkan kolom updated_at dengan nilai default current_timestamp
    pgm.addColumn('playlists', {
        updated_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });
};

exports.down = (pgm) => {
    // Menghapus kolom created_at jika rollback dilakukan
    pgm.dropColumn('playlists', 'created_at');

    // Menghapus kolom updated_at jika rollback dilakukan
    pgm.dropColumn('playlists', 'updated_at');
};