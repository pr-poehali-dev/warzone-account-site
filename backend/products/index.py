'''
Business: API для управления товарами (аккаунтами) - получение списка, добавление, обновление
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с товарами или статусом операции
'''

import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # GET - получить список товаров
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            category = params.get('category')
            featured = params.get('featured')
            
            query = '''
                SELECT p.*, c.name as category_name, c.slug as category_slug
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.is_available = true
            '''
            
            if category:
                query += f" AND c.slug = '{category}'"
            if featured == 'true':
                query += " AND p.is_featured = true"
                
            query += " ORDER BY p.created_at DESC"
            
            cursor.execute(query)
            products = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(p) for p in products], default=str),
                'isBase64Encoded': False
            }
        
        # POST - добавить новый товар
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO products 
                (title, description, category_id, price, original_price, discount_percent, 
                 level, kills, wins, kd_ratio, weapons_unlocked, skins_count, image_url, is_featured)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('category_id'),
                body.get('price'),
                body.get('original_price'),
                body.get('discount_percent', 0),
                body.get('level'),
                body.get('kills'),
                body.get('wins'),
                body.get('kd_ratio'),
                body.get('weapons_unlocked'),
                body.get('skins_count'),
                body.get('image_url'),
                body.get('is_featured', False)
            ))
            
            product = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(product), default=str),
                'isBase64Encoded': False
            }
        
        # PUT - обновить товар
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            product_id = body.get('id')
            
            cursor.execute('''
                UPDATE products 
                SET title = %s, description = %s, category_id = %s, price = %s, 
                    original_price = %s, discount_percent = %s, level = %s, kills = %s,
                    wins = %s, kd_ratio = %s, weapons_unlocked = %s, skins_count = %s,
                    image_url = %s, is_featured = %s, is_available = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('category_id'),
                body.get('price'),
                body.get('original_price'),
                body.get('discount_percent', 0),
                body.get('level'),
                body.get('kills'),
                body.get('wins'),
                body.get('kd_ratio'),
                body.get('weapons_unlocked'),
                body.get('skins_count'),
                body.get('image_url'),
                body.get('is_featured', False),
                body.get('is_available', True),
                product_id
            ))
            
            product = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(product) if product else {}, default=str),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
