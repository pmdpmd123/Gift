#!/usr/bin/env python3
"""
Simple HTTP Server for the 3D Gift Box Project
Chạy lệnh: python server.py
Sau đó mở http://localhost:8000 trong trình duyệt
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Thêm headers để tránh CORS issues
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        super().end_headers()

def main():
    # Chuyển đến thư mục chứa project
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🎁 Gift Box Server đang chạy tại http://localhost:{PORT}")
        print("📝 Mở trình duyệt và vào địa chỉ trên để xem gift box 3D!")
        print("🎯 Click vào màn hình để mở hộp quà và xem text 'Chị Hai Cho Em Tiền'")
        print("⏹️  Nhấn Ctrl+C để dừng server")
        
        # Tự động mở trình duyệt
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server đã dừng!")

if __name__ == "__main__":
    main()
