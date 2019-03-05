import logging


logger = logging.getLogger('db.tendersaucer.utils')


def fetch_all(pool, query, params):
    conn = None
    cursor = None
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params)
        return cursor.fetchall() or []
    except Exception as e:
        logger.exception(e)
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def fetch_one(pool, query, params):
    conn = None
    cursor = None
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params)
        return cursor.fetchone() or None
    except Exception as e:
        logger.exception(e)
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def execute(pool, statement, params=None, multi=False):
    conn = None
    cursor = None
    try:
        conn = pool.get_connection()
        cursor = conn.cursor()

        if multi:
            last_row_ids = []
            results = cursor.execute(statement, params, multi=multi)
            for result in results or ():
                last_row_ids.append(result.lastrowid)
        else:
            cursor.execute(statement, params, multi=multi)
            last_row_ids = cursor.lastrowid

        conn.commit()
    except Exception as e:
        logger.exception(e)
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    return last_row_ids


def handle_list_params(query, params):
    new_params = {}
    for key, value in params.items():
        if hasattr(value, '__iter__'):
            if not isinstance(value, list):
                value = list(value)
            list_value_params = []
            for i in range(len(value)):
                key_i = key + str(i)
                new_params[key_i] = value[i]
                list_value_params.append('%({})s'.format(key_i))
            query = query.replace(
                '%({})s'.format(key), ','.join(list_value_params))
        else:
            new_params[key] = value

    return query, new_params
