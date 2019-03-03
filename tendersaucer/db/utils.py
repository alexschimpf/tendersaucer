import logging


logger = logging.getLogger('db.tendersaucer.utils')


def execute(pool, statement, params=None, multi=False):
    conn = None
    cursor = None
    inserted_row_ids = None
    try:
        conn = pool.get_connection()
        cursor = conn.cursor()

        if multi:
            inserted_row_ids = []
            results = cursor.execute(statement, params, multi=multi)
            for result in results or ():
                inserted_row_ids.append(result.lastrowid)
        else:
            cursor.execute(statement, params, multi=multi)
            inserted_row_ids = cursor.lastrowid

        conn.commit()
    except Exception as e:
        logger.exception(e)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    return inserted_row_ids
