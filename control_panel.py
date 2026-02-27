import tkinter as tk
from tkinter import scrolledtext
import subprocess
import threading
import os
import webbrowser
import psutil


class CityWatcherControlPanel:
    def __init__(self, root):
        self.root = root
        self.root.title("CityWatcher Control Panel")
        self.root.geometry("1100x800")
        self.root.configure(bg='#0a0a0a')
        self.root.minsize(900, 650)

        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.backend_dir = os.path.join(self.base_dir, 'admin-dashboard', 'backend')
        self.frontend_dir = os.path.join(self.base_dir, 'admin-dashboard', 'frontend')
        self.venv_python = os.path.join(self.backend_dir, 'venv', 'Scripts', 'python.exe')
        # Use system node/npm from PATH
        self.node_exe = 'node'
        self.npm_cmd = 'npm'

        # Process tracking - Mobile App
        self.mobile_process = None
        self.mobile_pid = None
        self.mobile_running = False
        self.is_tunnel = False

        # Process tracking - Admin Backend
        self.backend_process = None
        self.backend_pid = None
        self.backend_running = False

        # Process tracking - Admin Frontend
        self.frontend_process = None
        self.frontend_pid = None
        self.frontend_running = False

        # Colors
        self.bg_dark = '#0d1117'
        self.bg_panel = '#161b22'
        self.bg_card = '#21262d'
        self.primary = '#F5A623'
        self.green = '#4CAF50'
        self.red = '#E74C3C'
        self.blue = '#5B9BD5'
        self.purple = '#9C27B0'
        self.text_primary = '#FFFFFF'
        self.text_secondary = '#8b949e'
        self.border = '#30363d'

        self.current_tab = 'dashboard'
        self.setup_ui()
        self.update_statuses()

    # ── UI Setup ──────────────────────────────────────────────

    def setup_ui(self):
        # Header
        header = tk.Frame(self.root, bg=self.bg_dark)
        header.pack(fill='x', padx=20, pady=(15, 5))

        tk.Label(header, text="🏙️ CityWatcher Control Panel",
                 font=('Segoe UI', 24, 'bold'), fg=self.primary,
                 bg=self.bg_dark).pack(side='left')

        tk.Label(header, text="Mobile App + Admin Dashboard Manager",
                 font=('Segoe UI', 11), fg=self.text_secondary,
                 bg=self.bg_dark).pack(side='left', padx=(15, 0), pady=(8, 0))

        # Tab bar
        self.tab_frame = tk.Frame(self.root, bg=self.bg_dark)
        self.tab_frame.pack(fill='x', padx=20, pady=(10, 0))
        self.tab_buttons = {}
        for tab_id, label in [('dashboard', '📊 Overview'),
                               ('mobile', '📱 Mobile App'),
                               ('admin', '🖥️ Admin Dashboard'),
                               ('tools', '🔧 Tools')]:
            btn = tk.Button(self.tab_frame, text=label, font=('Segoe UI', 10, 'bold'),
                            bg=self.bg_card, fg=self.text_secondary, relief='flat',
                            cursor='hand2', padx=16, pady=6,
                            command=lambda t=tab_id: self.switch_tab(t))
            btn.pack(side='left', padx=(0, 4))
            self.tab_buttons[tab_id] = btn

        # Content area
        self.content = tk.Frame(self.root, bg=self.bg_dark)
        self.content.pack(fill='both', expand=True, padx=20, pady=10)

        # Log panel at bottom
        log_frame = tk.Frame(self.root, bg=self.bg_panel, highlightbackground=self.border,
                             highlightthickness=1)
        log_frame.pack(fill='both', expand=True, padx=20, pady=(0, 15))

        log_header = tk.Frame(log_frame, bg=self.bg_panel)
        log_header.pack(fill='x', padx=10, pady=(8, 0))
        tk.Label(log_header, text="📋 Logs", font=('Segoe UI', 11, 'bold'),
                 fg=self.primary, bg=self.bg_panel).pack(side='left')
        tk.Button(log_header, text="Clear", font=('Segoe UI', 9),
                  bg=self.bg_card, fg=self.text_secondary, relief='flat',
                  cursor='hand2', command=self.clear_logs).pack(side='right')

        self.log_text = scrolledtext.ScrolledText(
            log_frame, font=('Cascadia Code', 9), bg='#0d1117',
            fg='#c9d1d9', insertbackground='#FFFFFF', relief='flat',
            wrap='word', height=10)
        self.log_text.pack(fill='both', expand=True, padx=10, pady=(5, 10))

        self.switch_tab('dashboard')

    def switch_tab(self, tab_id):
        self.current_tab = tab_id
        for tid, btn in self.tab_buttons.items():
            if tid == tab_id:
                btn.config(bg=self.primary, fg='#000000')
            else:
                btn.config(bg=self.bg_card, fg=self.text_secondary)

        for w in self.content.winfo_children():
            w.destroy()

        if tab_id == 'dashboard':
            self.build_dashboard_tab()
        elif tab_id == 'mobile':
            self.build_mobile_tab()
        elif tab_id == 'admin':
            self.build_admin_tab()
        elif tab_id == 'tools':
            self.build_tools_tab()

    # ── Dashboard Tab ─────────────────────────────────────────

    def build_dashboard_tab(self):
        f = self.content

        # Status cards row
        cards = tk.Frame(f, bg=self.bg_dark)
        cards.pack(fill='x', pady=(0, 10))

        self.dash_mobile_status = self._status_card(cards, "Mobile App", "● Stopped", self.red)
        self.dash_backend_status = self._status_card(cards, "Admin Backend", "● Stopped", self.red)
        self.dash_frontend_status = self._status_card(cards, "Admin Frontend", "● Stopped", self.red)

        # Quick actions
        actions = tk.Frame(f, bg=self.bg_panel, highlightbackground=self.border, highlightthickness=1)
        actions.pack(fill='x', pady=5)
        tk.Label(actions, text="Quick Actions", font=('Segoe UI', 12, 'bold'),
                 fg=self.primary, bg=self.bg_panel).pack(anchor='w', padx=12, pady=(10, 5))

        btn_row = tk.Frame(actions, bg=self.bg_panel)
        btn_row.pack(fill='x', padx=12, pady=(0, 12))

        self._action_btn(btn_row, "▶ Start All", self.green, self.start_all).pack(side='left', padx=(0, 8))
        self._action_btn(btn_row, "■ Stop All", self.red, self.stop_all).pack(side='left', padx=(0, 8))
        self._action_btn(btn_row, "🌐 Open Dashboard", self.blue, self.open_dashboard_browser).pack(side='left', padx=(0, 8))
        self._action_btn(btn_row, "🔄 Reseed DB", self.purple, self.seed_database).pack(side='left', padx=(0, 8))

    def _status_card(self, parent, title, status_text, color):
        card = tk.Frame(parent, bg=self.bg_card, highlightbackground=self.border,
                        highlightthickness=1, padx=16, pady=12)
        card.pack(side='left', fill='x', expand=True, padx=(0, 8))
        tk.Label(card, text=title, font=('Segoe UI', 10), fg=self.text_secondary,
                 bg=self.bg_card).pack(anchor='w')
        lbl = tk.Label(card, text=status_text, font=('Segoe UI', 14, 'bold'),
                       fg=color, bg=self.bg_card)
        lbl.pack(anchor='w', pady=(4, 0))
        return lbl

    def _action_btn(self, parent, text, color, command):
        btn = tk.Button(parent, text=text, font=('Segoe UI', 10, 'bold'),
                        bg=color, fg='#ffffff', activebackground=color,
                        relief='flat', cursor='hand2', padx=14, pady=6,
                        command=command)
        return btn

    # ── Mobile App Tab ────────────────────────────────────────

    def build_mobile_tab(self):
        f = self.content

        info = tk.Frame(f, bg=self.bg_panel, highlightbackground=self.border, highlightthickness=1)
        info.pack(fill='x', pady=(0, 10))
        tk.Label(info, text="Expo React Native Server", font=('Segoe UI', 12, 'bold'),
                 fg=self.primary, bg=self.bg_panel).pack(anchor='w', padx=12, pady=(10, 2))
        self.mobile_status_lbl = tk.Label(info, text="● Stopped", font=('Segoe UI', 13, 'bold'),
                                          fg=self.red, bg=self.bg_panel)
        self.mobile_status_lbl.pack(anchor='w', padx=12)
        self.mobile_info_lbl = tk.Label(info, text="PID: N/A | Mode: N/A",
                                        font=('Segoe UI', 10), fg=self.text_secondary, bg=self.bg_panel)
        self.mobile_info_lbl.pack(anchor='w', padx=12, pady=(0, 10))

        btns = tk.Frame(f, bg=self.bg_dark)
        btns.pack(fill='x', pady=5)
        self._action_btn(btns, "▶ Start Local", self.green, self.start_mobile_local).pack(side='left', padx=(0, 8))
        self._action_btn(btns, "🌐 Start Tunnel", self.primary, self.start_mobile_tunnel).pack(side='left', padx=(0, 8))
        self._action_btn(btns, "■ Stop", self.red, self.stop_mobile).pack(side='left', padx=(0, 8))

        btns2 = tk.Frame(f, bg=self.bg_dark)
        btns2.pack(fill='x', pady=5)
        self._action_btn(btns2, "📱 Android", self.green, self.start_android).pack(side='left', padx=(0, 8))
        self._action_btn(btns2, "🌍 Web", self.blue, self.start_web).pack(side='left', padx=(0, 8))
        self._action_btn(btns2, "📲 Open DevTools (QR Code)", self.purple, self.open_expo_devtools).pack(side='left', padx=(0, 8))

    # ── Admin Dashboard Tab ───────────────────────────────────

    def build_admin_tab(self):
        f = self.content

        # Backend section
        be = tk.Frame(f, bg=self.bg_panel, highlightbackground=self.border, highlightthickness=1)
        be.pack(fill='x', pady=(0, 10))
        tk.Label(be, text="Flask Backend (Port 5000)", font=('Segoe UI', 12, 'bold'),
                 fg=self.primary, bg=self.bg_panel).pack(anchor='w', padx=12, pady=(10, 2))
        self.be_status_lbl = tk.Label(be, text="● Stopped", font=('Segoe UI', 13, 'bold'),
                                      fg=self.red, bg=self.bg_panel)
        self.be_status_lbl.pack(anchor='w', padx=12)
        self.be_info_lbl = tk.Label(be, text="PID: N/A",
                                    font=('Segoe UI', 10), fg=self.text_secondary, bg=self.bg_panel)
        self.be_info_lbl.pack(anchor='w', padx=12, pady=(0, 10))

        be_btns = tk.Frame(f, bg=self.bg_dark)
        be_btns.pack(fill='x', pady=5)
        self._action_btn(be_btns, "▶ Start Backend", self.green, self.start_backend).pack(side='left', padx=(0, 8))
        self._action_btn(be_btns, "■ Stop Backend", self.red, self.stop_backend).pack(side='left', padx=(0, 8))
        self._action_btn(be_btns, "🔄 Seed Database", self.purple, self.seed_database).pack(side='left', padx=(0, 8))

        # Frontend section
        fe = tk.Frame(f, bg=self.bg_panel, highlightbackground=self.border, highlightthickness=1)
        fe.pack(fill='x', pady=(10, 10))
        tk.Label(fe, text="React Frontend (Vite Dev Server)", font=('Segoe UI', 12, 'bold'),
                 fg=self.primary, bg=self.bg_panel).pack(anchor='w', padx=12, pady=(10, 2))
        self.fe_status_lbl = tk.Label(fe, text="● Stopped", font=('Segoe UI', 13, 'bold'),
                                      fg=self.red, bg=self.bg_panel)
        self.fe_status_lbl.pack(anchor='w', padx=12)
        self.fe_info_lbl = tk.Label(fe, text="PID: N/A",
                                    font=('Segoe UI', 10), fg=self.text_secondary, bg=self.bg_panel)
        self.fe_info_lbl.pack(anchor='w', padx=12, pady=(0, 10))

        fe_btns = tk.Frame(f, bg=self.bg_dark)
        fe_btns.pack(fill='x', pady=5)
        self._action_btn(fe_btns, "▶ Start Frontend", self.green, self.start_frontend).pack(side='left', padx=(0, 8))
        self._action_btn(fe_btns, "■ Stop Frontend", self.red, self.stop_frontend).pack(side='left', padx=(0, 8))
        self._action_btn(fe_btns, "🌐 Open in Browser", self.blue, self.open_dashboard_browser).pack(side='left', padx=(0, 8))

    # ── Tools Tab ─────────────────────────────────────────────

    def build_tools_tab(self):
        f = self.content

        tools = tk.Frame(f, bg=self.bg_panel, highlightbackground=self.border, highlightthickness=1)
        tools.pack(fill='x', pady=(0, 10))
        tk.Label(tools, text="Database & Maintenance", font=('Segoe UI', 12, 'bold'),
                 fg=self.primary, bg=self.bg_panel).pack(anchor='w', padx=12, pady=(10, 8))

        row1 = tk.Frame(tools, bg=self.bg_panel)
        row1.pack(fill='x', padx=12, pady=(0, 10))
        self._action_btn(row1, "🔄 Reseed Database", self.purple, self.seed_database).pack(side='left', padx=(0, 8))
        self._action_btn(row1, "🗑️ Reset Database", self.red, self.reset_database).pack(side='left', padx=(0, 8))
        self._action_btn(row1, "📦 Install Backend Deps", self.blue, self.install_backend_deps).pack(side='left', padx=(0, 8))

        tools2 = tk.Frame(f, bg=self.bg_panel, highlightbackground=self.border, highlightthickness=1)
        tools2.pack(fill='x', pady=(0, 10))
        tk.Label(tools2, text="Frontend Tools", font=('Segoe UI', 12, 'bold'),
                 fg=self.primary, bg=self.bg_panel).pack(anchor='w', padx=12, pady=(10, 8))

        row2 = tk.Frame(tools2, bg=self.bg_panel)
        row2.pack(fill='x', padx=12, pady=(0, 10))
        self._action_btn(row2, "📦 Install Frontend Deps", self.blue, self.install_frontend_deps).pack(side='left', padx=(0, 8))
        self._action_btn(row2, "🏗️ Build Frontend", self.primary, self.build_frontend).pack(side='left', padx=(0, 8))

        tools3 = tk.Frame(f, bg=self.bg_panel, highlightbackground=self.border, highlightthickness=1)
        tools3.pack(fill='x', pady=(0, 10))
        tk.Label(tools3, text="Quick Links", font=('Segoe UI', 12, 'bold'),
                 fg=self.primary, bg=self.bg_panel).pack(anchor='w', padx=12, pady=(10, 8))

        row3 = tk.Frame(tools3, bg=self.bg_panel)
        row3.pack(fill='x', padx=12, pady=(0, 10))
        self._action_btn(row3, "🌐 Dashboard (5173)", self.blue,
                         lambda: webbrowser.open('http://localhost:5173')).pack(side='left', padx=(0, 8))
        self._action_btn(row3, "🔌 API (5000)", self.green,
                         lambda: webbrowser.open('http://localhost:5000/api/auth/login')).pack(side='left', padx=(0, 8))

        # Info
        info = tk.Frame(f, bg=self.bg_panel, highlightbackground=self.border, highlightthickness=1)
        info.pack(fill='x')
        tk.Label(info, text="Login Credentials", font=('Segoe UI', 12, 'bold'),
                 fg=self.primary, bg=self.bg_panel).pack(anchor='w', padx=12, pady=(10, 5))
        tk.Label(info, text="Admin: admin@citywatcher.co.za / admin123",
                 font=('Cascadia Code', 10), fg=self.text_primary, bg=self.bg_panel).pack(anchor='w', padx=12)
        tk.Label(info, text="Staff: cape.admin@citywatcher.co.za / password123",
                 font=('Cascadia Code', 10), fg=self.text_secondary, bg=self.bg_panel).pack(anchor='w', padx=12, pady=(0, 12))

    # ── Logging ───────────────────────────────────────────────

    def log(self, message):
        self.log_text.insert('end', message + '\n')
        self.log_text.see('end')

    def clear_logs(self):
        self.log_text.delete('1.0', 'end')

    # ── Status Updates ────────────────────────────────────────

    def update_statuses(self):
        mobile_alive = self.mobile_process and self.mobile_process.poll() is None
        backend_alive = self.backend_process and self.backend_process.poll() is None
        frontend_alive = self.frontend_process and self.frontend_process.poll() is None

        # Update dashboard tab cards if visible
        if self.current_tab == 'dashboard':
            try:
                self._update_card(self.dash_mobile_status, mobile_alive, self.mobile_pid)
                self._update_card(self.dash_backend_status, backend_alive, self.backend_pid)
                self._update_card(self.dash_frontend_status, frontend_alive, self.frontend_pid)
            except tk.TclError:
                pass

        # Update mobile tab if visible
        if self.current_tab == 'mobile':
            try:
                if mobile_alive:
                    mode = "Tunnel" if self.is_tunnel else "Local"
                    self.mobile_status_lbl.config(text="● Running", fg=self.green)
                    self.mobile_info_lbl.config(text=f"PID: {self.mobile_pid} | Mode: {mode}")
                else:
                    self.mobile_status_lbl.config(text="● Stopped", fg=self.red)
                    self.mobile_info_lbl.config(text="PID: N/A | Mode: N/A")
            except tk.TclError:
                pass

        # Update admin tab if visible
        if self.current_tab == 'admin':
            try:
                if backend_alive:
                    self.be_status_lbl.config(text="● Running", fg=self.green)
                    self.be_info_lbl.config(text=f"PID: {self.backend_pid} | http://localhost:5000")
                else:
                    self.be_status_lbl.config(text="● Stopped", fg=self.red)
                    self.be_info_lbl.config(text="PID: N/A")

                if frontend_alive:
                    self.fe_status_lbl.config(text="● Running", fg=self.green)
                    self.fe_info_lbl.config(text=f"PID: {self.frontend_pid} | http://localhost:5173")
                else:
                    self.fe_status_lbl.config(text="● Stopped", fg=self.red)
                    self.fe_info_lbl.config(text="PID: N/A")
            except tk.TclError:
                pass

        self.root.after(1500, self.update_statuses)

    def _update_card(self, label, alive, pid):
        if alive:
            label.config(text=f"● Running (PID {pid})", fg=self.green)
        else:
            label.config(text="● Stopped", fg=self.red)

    # ── Process Helpers ───────────────────────────────────────

    def _start_process(self, cmd, cwd, name):
        self.log(f"Starting {name}...")
        try:
            env = os.environ.copy()
            if 'node' in cmd.lower() or 'npm' in cmd.lower():
                node_dir = os.path.dirname(self.node_exe)
                env['PATH'] = node_dir + ';' + env.get('PATH', '')

            proc = subprocess.Popen(
                cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                text=True, bufsize=1, cwd=cwd, env=env)

            thread = threading.Thread(target=self._read_output, args=(proc, name), daemon=True)
            thread.start()

            self.log(f"{name} started with PID: {proc.pid}")
            return proc
        except Exception as e:
            self.log(f"Error starting {name}: {e}")
            return None

    def _stop_process(self, proc, name):
        if not proc or proc.poll() is not None:
            self.log(f"{name} is not running.")
            return
        self.log(f"Stopping {name}...")
        try:
            parent = psutil.Process(proc.pid)
            for child in parent.children(recursive=True):
                child.kill()
            parent.kill()
            proc.wait(timeout=5)
            self.log(f"{name} stopped.")
        except Exception as e:
            self.log(f"Error stopping {name}: {e}")
            try:
                proc.terminate()
            except Exception:
                pass

    def _read_output(self, proc, name):
        prefix = f"[{name}]"
        while proc.poll() is None:
            try:
                line = proc.stdout.readline()
                if line:
                    self.log(f"{prefix} {line.strip()}")
            except Exception:
                break
        self.log(f"{prefix} Process exited.")

    # ── Mobile App Commands ───────────────────────────────────

    def start_mobile_local(self):
        if self.mobile_process and self.mobile_process.poll() is None:
            self.log("Mobile server already running!")
            return
        self.is_tunnel = False
        cmd = 'npm start'
        self.mobile_process = self._start_process(cmd, self.base_dir, "Mobile App")
        if self.mobile_process:
            self.mobile_pid = self.mobile_process.pid

    def start_mobile_tunnel(self):
        if self.mobile_process and self.mobile_process.poll() is None:
            self.log("Mobile server already running!")
            return
        self.is_tunnel = True
        cmd = 'npx expo start --tunnel'
        self.mobile_process = self._start_process(cmd, self.base_dir, "Mobile Tunnel")
        if self.mobile_process:
            self.mobile_pid = self.mobile_process.pid

    def stop_mobile(self):
        self._stop_process(self.mobile_process, "Mobile App")
        self.mobile_process = None
        self.mobile_pid = None

    def start_android(self):
        if not self.mobile_process or self.mobile_process.poll() is not None:
            self.log("Start the mobile server first!")
            return
        self.log("Opening Android emulator...")
        cmd = 'npm run android'
        subprocess.Popen(cmd, shell=True, cwd=self.base_dir)

    def start_web(self):
        if not self.mobile_process or self.mobile_process.poll() is not None:
            self.log("Start the mobile server first!")
            return
        self.log("Opening web browser...")
        cmd = 'npm run web'
        subprocess.Popen(cmd, shell=True, cwd=self.base_dir)

    def open_expo_devtools(self):
        if not self.mobile_process or self.mobile_process.poll() is not None:
            self.log("Start the mobile server first!")
            return
        self.log("Opening Expo DevTools with QR code...")
        # Expo DevTools typically runs on port 8081
        webbrowser.open('http://localhost:8081')
        self.log("If DevTools doesn't open, check the logs for the Expo URL")

    # ── Admin Backend Commands ────────────────────────────────

    def start_backend(self):
        if self.backend_process and self.backend_process.poll() is None:
            self.log("Backend already running!")
            return
        # Use venv python if exists, otherwise system python
        if os.path.exists(self.venv_python):
            python_cmd = f'"{self.venv_python}"'
        else:
            python_cmd = 'python'
            self.log("Warning: venv not found, using system Python")
        cmd = f'{python_cmd} run.py'
        self.backend_process = self._start_process(cmd, self.backend_dir, "Flask Backend")
        if self.backend_process:
            self.backend_pid = self.backend_process.pid

    def stop_backend(self):
        self._stop_process(self.backend_process, "Flask Backend")
        self.backend_process = None
        self.backend_pid = None

    # ── Admin Frontend Commands ───────────────────────────────

    def start_frontend(self):
        if self.frontend_process and self.frontend_process.poll() is None:
            self.log("Frontend already running!")
            return
        cmd = 'npm run dev'
        self.frontend_process = self._start_process(cmd, self.frontend_dir, "React Frontend")
        if self.frontend_process:
            self.frontend_pid = self.frontend_process.pid

    def stop_frontend(self):
        self._stop_process(self.frontend_process, "React Frontend")
        self.frontend_process = None
        self.frontend_pid = None

    # ── Combined Commands ─────────────────────────────────────

    def start_all(self):
        self.log("=== Starting all services ===")
        self.start_backend()
        self.root.after(2000, self.start_frontend)

    def stop_all(self):
        self.log("=== Stopping all services ===")
        self.stop_frontend()
        self.stop_backend()
        self.stop_mobile()

    def open_dashboard_browser(self):
        self.log("Opening admin dashboard in browser...")
        webbrowser.open('http://localhost:5173')

    # ── Tool Commands ─────────────────────────────────────────

    def seed_database(self):
        def _run():
            self.log("Seeding database...")
            try:
                result = subprocess.run(
                    [self.venv_python, 'seed.py'],
                    cwd=self.backend_dir, capture_output=True, text=True, timeout=30)
                if result.stdout:
                    self.log(result.stdout.strip())
                if result.stderr:
                    self.log(result.stderr.strip())
                self.log("Database seeded successfully!" if result.returncode == 0 else "Seed failed!")
            except Exception as e:
                self.log(f"Seed error: {e}")
        threading.Thread(target=_run, daemon=True).start()

    def reset_database(self):
        db_path = os.path.join(self.backend_dir, 'instance', 'citywatcher.db')
        if os.path.exists(db_path):
            try:
                os.remove(db_path)
                self.log("Database deleted. Run 'Reseed' to recreate.")
            except Exception as e:
                self.log(f"Error deleting DB: {e}")
        else:
            self.log("No database file found.")

    def install_backend_deps(self):
        def _run():
            self.log("Installing backend dependencies...")
            try:
                pip = os.path.join(self.backend_dir, 'venv', 'Scripts', 'pip.exe')
                req = os.path.join(self.backend_dir, 'requirements.txt')
                result = subprocess.run([pip, 'install', '-r', req],
                                        capture_output=True, text=True, timeout=120)
                self.log(result.stdout.strip() if result.stdout else "Done.")
                if result.returncode != 0 and result.stderr:
                    self.log(result.stderr.strip())
            except Exception as e:
                self.log(f"Install error: {e}")
        threading.Thread(target=_run, daemon=True).start()

    def install_frontend_deps(self):
        def _run():
            self.log("Installing frontend dependencies...")
            try:
                result = subprocess.run(
                    ['npm', 'install'],
                    cwd=self.frontend_dir, capture_output=True, text=True, timeout=120)
                self.log(result.stdout.strip() if result.stdout else "Done.")
            except Exception as e:
                self.log(f"Install error: {e}")
        threading.Thread(target=_run, daemon=True).start()

    def build_frontend(self):
        def _run():
            self.log("Building frontend for production...")
            try:
                result = subprocess.run(
                    ['npm', 'run', 'build'],
                    cwd=self.frontend_dir, capture_output=True, text=True, timeout=120)
                self.log(result.stdout.strip() if result.stdout else "Build complete.")
                if result.stderr:
                    self.log(result.stderr.strip())
            except Exception as e:
                self.log(f"Build error: {e}")
        threading.Thread(target=_run, daemon=True).start()


if __name__ == "__main__":
    root = tk.Tk()
    app = CityWatcherControlPanel(root)
    root.mainloop()
