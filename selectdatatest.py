import sqlite3


def get_all(database, columns):
    selected_columns = ", ".join(
        f'"{column}"' for column in columns
    )

    with sqlite3.connect(database) as connection:

        connection.row_factory = sqlite3.Row

        rows = connection.execute(
            f'''
            SELECT {selected_columns}
            FROM "สายการเรียน"
            '''
        ).fetchall()

    return [dict(row) for row in rows]


def Interest(database):

    return get_all(
        database,
        [
            "สาย",
            "สาขา",
            "จุดเด่น",
            "เหมาะกับใคร"
        ]
    )


def Limitations(database):

    return get_all(
        database,
        [
            "สาย",
            "สาขา",
            "ข้อพิจารณา",
            "เหมาะกับใคร"
        ]
    )


def Skills(database):

    return get_all(
        database,
        [
            "สาย",
            "สาขา",
            "ทักษะได้รับ",
            "จุดเด่น"
        ]
    )


def Subjects(database):

    return get_all(
        database,
        [
            "สาย",
            "สาขา",
            "วิชาเสริม",
            "จุดเด่น"
        ]
    )


def Universities(database):

    return get_all(
        database,
        [
            "สาย",
            "สาขา",
            "สาขาในมหาวิทยาลัยที่เกี่ยวข้อง",
            "ทักษะได้รับ"
        ]
    )