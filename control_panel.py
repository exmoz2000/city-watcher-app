import tkinter as tk
from tkinter import ttk, scrolledtext
import subprocess
import threading
import os
import signal
import psutil
import re

class CityWatcherControlPanel:
    def __init__(self, root):
        self.root = root
        self.root.title("CityWatcher Control Panel")
        self.root.geometry("1000x700")
        self.root.configure(bg='#0a0a0a')
        
        # Process tracking
        self.process = None
        self.process_pid = None
        self.is_tunnel = False
        self.output_thread = None
        self.running = False
        
        # Colors - dark theme with CityWatcher accents
        self.bg_dark = '#1a1a1a'  # dark background
        self.bg_panel = '#2a2a2a'  # panel background
        self.primary_orange = '#F5A623'  # primaryOrange
        self.amber = '#F7B731'  # primaryAmber
        self.green = '#4CAF50'  # successGreen
        self.red = '#E74C3C'  # emergencyRed
        self.blue = '#5B9BD5'  # infoBlue
        self.text_primary = '#FFFFFF'
        self.text_secondary = '#AAAAAA'
        self.border = '#F5A623'
        
        self.setup_ui()
        self.update_status()
        
    def setup_ui(self):
        # Header
        header_frame = tk.Frame(self.root, bg=self.bg_dark)
        header_frame.pack(fill='x', pady=20)
        
        title_label = tk.Label(
            header_frame,
            text="🚀 CityWatcher Control Panel",
            font=('Arial', 28, 'bold'),
            fg=self.primary_orange,
            bg=self.bg_dark
        )
        title_label.pack()
        
        subtitle_label = tk.Label(
            header_frame,
            text="Expo React Native App Manager",
            font=('Arial', 12),
            fg=self.text_secondary,
            bg=self.bg_dark
        )
        subtitle_label.pack()
        
        # Status Panel
        status_frame = tk.Frame(self.root, bg=self.bg_panel, highlightbackground=self.border, highlightthickness=2)
        status_frame.pack(fill='x', padx=30, pady=10)
        
        status_title = tk.Label(
            status_frame,
            text="Server Status",
            font=('Arial', 14, 'bold'),
            fg=self.primary_orange,
            bg=self.bg_panel
        )
        status_title.pack(anchor='w', padx=10, pady=(10, 5))
        
        self.status_label = tk.Label(
            status_frame,
            text="● Server Stopped",
            font=('Arial', 16, 'bold'),
            fg=self.red,
            bg=self.bg_panel
        )
        self.status_label.pack(pady=10)
        
        self.info_label = tk.Label(
            status_frame,
            text="PID: N/A | Mode: N/A",
            font=('Arial', 11),
            fg=self.text_secondary,
            bg=self.bg_panel
        )
        self.info_label.pack(pady=(0, 10))
        
        # Control Buttons
        button_frame = tk.Frame(self.root, bg=self.bg_dark)
        button_frame.pack(pady=20)
        
        self.start_btn = tk.Button(
            button_frame,
            text="▶ Start Server",
            font=('Arial', 12, 'bold'),
            bg=self.green,
            fg='#ffffff',
            activebackground='#45a049',
            width=15,
            height=2,
            relief='flat',
            cursor='hand2',
            command=self.start_server
        )
        self.start_btn.grid(row=0, column=0, padx=10)
        
        self.stop_btn = tk.Button(
            button_frame,
            text="■ Stop Server",
            font=('Arial', 12, 'bold'),
            bg=self.red,
            fg='#ffffff',
            activebackground='#d32f2f',
            width=15,
            height=2,
            relief='flat',
            cursor='hand2',
            command=self.stop_server,
            state='disabled'
        )
        self.stop_btn.grid(row=0, column=1, padx=10)
        
        self.tunnel_btn = tk.Button(
            button_frame,
            text="🌐 Start Tunnel",
            font=('Arial', 12, 'bold'),
            bg=self.primary_orange,
            fg='#ffffff',
            activebackground='#e09517',
            width=15,
            height=2,
            relief='flat',
            cursor='hand2',
            command=self.start_tunnel
        )
        self.tunnel_btn.grid(row=0, column=2, padx=10)
        
        # Additional buttons
        button_frame2 = tk.Frame(self.root, bg=self.bg_dark)
        button_frame2.pack(pady=10)
        
        self.android_btn = tk.Button(
            button_frame2,
            text="📱 Android",
            font=('Arial', 10),
            bg=self.green,
            fg='#ffffff',
            width=12,
            relief='flat',
            cursor='hand2',
            command=self.start_android
        )
        self.android_btn.grid(row=0, column=0, padx=5)
        
        self.ios_btn = tk.Button(
            button_frame2,
            text="� iOS",
            font=('Arial', 10),
            bg='#CCCCCC',
            fg='#666666',
            width=12,
            relief='flat',
            state='disabled',
            command=self.show_ios_message
        )
        self.ios_btn.grid(row=0, column=1, padx=5)
        
        self.web_btn = tk.Button(
            button_frame2,
            text="🌍 Web",
            font=('Arial', 10),
            bg=self.blue,
            fg='#ffffff',
            width=12,
            relief='flat',
            cursor='hand2',
            command=self.start_web
        )
        self.web_btn.grid(row=0, column=2, padx=5)
        
        self.clear_btn = tk.Button(
            button_frame2,
            text="🗑️ Clear Logs",
            font=('Arial', 10),
            bg=self.text_secondary,
            fg='#ffffff',
            width=12,
            relief='flat',
            cursor='hand2',
            command=self.clear_logs
        )
        self.clear_btn.grid(row=0, column=3, padx=5)
        
        # Logs Panel
        logs_frame = tk.Frame(self.root, bg=self.bg_panel, highlightbackground=self.border, highlightthickness=2)
        logs_frame.pack(fill='both', expand=True, padx=30, pady=10)
        
        logs_title = tk.Label(
            logs_frame,
            text="Server Logs",
            font=('Arial', 14, 'bold'),
            fg=self.primary_orange,
            bg=self.bg_panel
        )
        logs_title.pack(anchor='w', padx=10, pady=(10, 5))
        
        self.log_text = scrolledtext.ScrolledText(
            logs_frame,
            font=('Consolas', 9),
            bg='#1a1a1a',
            fg='#FFFFFF',
            insertbackground='#FFFFFF',
            relief='flat',
            wrap='word'
        )
        self.log_text.pack(fill='both', expand=True, padx=10, pady=(0, 10))
        
    def log(self, message, color=None):
        if color is None:
            color = self.text_primary
        self.log_text.insert('end', message + '\n')
        self.log_text.see('end')
        
    def clear_logs(self):
        self.log_text.delete('1.0', 'end')
        
    def update_status(self):
        if self.process and self.process.poll() is None:
            self.status_label.config(text="● Server Running", fg=self.green)
            mode = "Tunnel Mode" if self.is_tunnel else "Local Mode"
            self.info_label.config(text=f"PID: {self.process_pid} | Mode: {mode}")
            self.start_btn.config(state='disabled')
            self.tunnel_btn.config(state='disabled')
            self.stop_btn.config(state='normal')
        else:
            self.status_label.config(text="● Server Stopped", fg=self.red)
            self.info_label.config(text="PID: N/A | Mode: N/A")
            self.start_btn.config(state='normal')
            self.tunnel_btn.config(state='normal')
            self.stop_btn.config(state='disabled')
            
        self.root.after(1000, self.update_status)
        
    def read_output(self):
        while self.running and self.process:
            try:
                line = self.process.stdout.readline()
                if line:
                    self.log(line.strip())
                elif self.process.poll() is not None:
                    break
            except:
                break
                
    def start_server(self):
        self.start_app(tunnel=False)
        
    def start_tunnel(self):
        self.start_app(tunnel=True)
        
    def start_app(self, tunnel=False):
        if self.process and self.process.poll() is None:
            self.log("Server is already running!", self.red)
            return
            
        try:
            self.is_tunnel = tunnel
            cmd = "npx expo start --tunnel" if tunnel else "npm start"
            mode = "tunnel" if tunnel else "local"
            
            self.log(f"Starting CityWatcher in {mode} mode...", self.primary_orange)
            
            self.process = subprocess.Popen(
                cmd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                cwd=os.path.dirname(os.path.abspath(__file__))
            )
            
            self.process_pid = self.process.pid
            self.running = True
            
            self.output_thread = threading.Thread(target=self.read_output, daemon=True)
            self.output_thread.start()
            
            self.log(f"Server started with PID: {self.process_pid}", self.green)
            
        except Exception as e:
            self.log(f"Error starting server: {str(e)}", self.red)
            
    def stop_server(self):
        if not self.process:
            self.log("No server is running!", self.red)
            return
            
        try:
            self.log("Stopping server...", self.primary_orange)
            self.running = False
            
            # Kill process tree
            try:
                parent = psutil.Process(self.process_pid)
                for child in parent.children(recursive=True):
                    child.kill()
                parent.kill()
            except:
                self.process.terminate()
                
            self.process.wait(timeout=5)
            self.process = None
            self.process_pid = None
            
            self.log("Server stopped successfully", self.green)
            
        except Exception as e:
            self.log(f"Error stopping server: {str(e)}", self.red)
            
    def start_android(self):
        if not self.process or self.process.poll() is not None:
            self.log("Please start the server first!", self.red)
            return
        self.log("Opening Android emulator...", self.green)
        subprocess.Popen("npm run android", shell=True, cwd=os.path.dirname(os.path.abspath(__file__)))
    
    def show_ios_message(self):
        self.log("iOS: This only works on MacOS - unavailable on Windows, please use the Android option", self.text_secondary)
        
    def start_web(self):
        if not self.process or self.process.poll() is not None:
            self.log("Please start the server first!", self.red)
            return
        self.log("Opening web browser...", self.blue)
        subprocess.Popen("npm run web", shell=True, cwd=os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    root = tk.Tk()
    app = CityWatcherControlPanel(root)
    root.mainloop()
