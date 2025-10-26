import sqlite3
from datetime import datetime

class ComplaintDatabase:
    def __init__(self, db_name='civic_complaints.db'):
        self.db_name = db_name
        self.init_db()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row  # Access columns by name
        return conn
    
    def init_db(self):
        """Initialize the complaints table"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS complaints (
                serial_no INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                image_base64 TEXT NOT NULL,
                issue_type TEXT,
                department TEXT,
                priority INTEGER,
                justification TEXT,
                confidence REAL,
                status TEXT DEFAULT 'pending',
                datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                location TEXT NOT NULL,
                pincode TEXT NOT NULL,
                zone TEXT NOT NULL
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully!")
    
    def insert_complaint(self, email, image_base64, issue_type, department, 
                        priority, justification, confidence, location, pincode, zone):
        """Insert a new complaint into the database"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO complaints 
                (email, image_base64, issue_type, department, priority, 
                 justification, confidence, status, location, pincode, zone)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
            ''', (email, image_base64, issue_type, department, priority, 
                  justification, confidence, location, pincode, zone))
            
            conn.commit()
            complaint_id = cursor.lastrowid
            conn.close()
            
            return complaint_id, None
        except Exception as e:
            return None, str(e)
    
    def get_complaint_by_id(self, serial_no):
        """Get a complaint by serial number"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM complaints WHERE serial_no = ?', (serial_no,))
        complaint = cursor.fetchone()
        conn.close()
        
        return dict(complaint) if complaint else None
    
    def get_complaints_by_email(self, email):
        """Get all complaints by a user's email"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT serial_no, email, issue_type, department, priority, 
                   status, datetime, location, pincode, zone, confidence
            FROM complaints 
            WHERE email = ?
            ORDER BY datetime DESC
        ''', (email,))
        
        complaints = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in complaints]
    
    def get_all_complaints(self):
        """Get all complaints (for admin)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT serial_no, email, issue_type, department, priority, 
                   status, datetime, location, pincode, zone, confidence
            FROM complaints 
            ORDER BY datetime DESC
        ''')
        
        complaints = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in complaints]
    
    def get_complaints_by_department(self, department):
        """Get complaints filtered by department (case-insensitive)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT serial_no, email, issue_type, department, priority, 
                status, datetime, location, pincode, zone, confidence
            FROM complaints 
            WHERE LOWER(TRIM(department)) = LOWER(TRIM(?))
            ORDER BY datetime DESC
        ''', (department,))
        
        complaints = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in complaints]

    
    def update_status(self, serial_no, status):
        """Update complaint status (for admin)"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE complaints 
                SET status = ?
                WHERE serial_no = ?
            ''', (status, serial_no))
            
            conn.commit()
            rows_affected = cursor.rowcount
            conn.close()
            
            if rows_affected > 0:
                return True, None
            else:
                return False, "Complaint not found"
        except Exception as e:
            return False, str(e)