# Music Gen Service - Python Serverless Music Generation

> AI-powered serverless music generation service using Modal, LangGraph, and HuggingFace models.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Python Setup Guide](#python-setup-guide)
  - [macOS Setup](#macos-setup)
  - [Linux Setup](#linux-setup)
  - [Windows Setup](#windows-setup)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Service](#running-the-service)
- [API Endpoints](#api-endpoints)
- [Service Architecture](#service-architecture)
- [Troubleshooting](#troubleshooting)
- [Appendix: Cloudinary Setup Guide](#appendix-cloudinary-setup-guide)

---

## Overview

The Music Gen Service is a serverless microservice that handles AI music generation, cover art creation, and video processing. It runs on Modal (a serverless platform) and processes requests from the main NestJS server via BullMQ job queue.

**Key Components:**

- `main.py` - FastAPI endpoint for music generation requests
- `ai_service.py` - Multi-step AI workflow orchestration with LanGraph with HuggingFace models
- `ace_step_service.py` - Core AI music generation using AceStep model
- `video_ai_service.py` - Video generation and processing
- `utils.py` - Helper functions for Cloudinary uploads, audio processing, etc.
- `schemas.py` - Request/response validation with Pydantic
- `prompts` - Prompt templates for AI models

---
## Service Architecture

```
┌─────────────────────────────────────────┐
│         NestJS Server (Port 3000)       │
│    Receives generation requests         │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │  BullMQ Queue   │
        │    (Redis)      │
        └────────┬────────┘
                 │
        ┌────────▼────────────────────┐
        │  Modal FastAPI Endpoint     │
        │  (main.generate_endpoint)   │
        └────────┬────────────────────┘
                 │
    ┌────────────┼────────────────┐
    │            │                │
    ▼            ▼                ▼
┌─────────┐ ┌──────────┐ ┌────────────────┐
│   AI    │ │   ACE    │ │     Video      │
│Service  │ │   Step   │ │     Service    │
│         │ │ Service  │ │                │
└────┬────┘ └────┬─────┘ └────────┬───────┘
     │           │                │
     └───────────┼────────────────┘
                 │
        ┌────────▼────────────┐
        │     Cloudinary      │
        │  (music-gen folder) │
        │  Audio, Cover,      │
        │  Videos, etc.       │
        └─────────────────────┘
```

---

### Graph Workflow Image

<img src="./graph_mermaid.png" alt="Music Gen Service Architecture" width="800"/>

## Prerequisites

Before starting, ensure your system has:

- Git
- Homebrew (macOS) or apt (Linux)
- Internet connection (for downloading Python and dependencies)
- ~5GB free disk space (for Python, dependencies, and models)

**Additional Requirements:**

- Cloudinary account (for file uploads)
- Modal account (for deploying the service)

---

## Python Setup Guide

### macOS Setup

#### Step 1: Install Homebrew (if not already installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, verify it:

```bash
brew --version
```

#### Step 2: Install pyenv

```bash
brew install pyenv
```

Verify installation:

```bash
pyenv --version
```

#### Step 3: Configure Shell for pyenv

Add pyenv initialization to your shell profile. Choose based on your shell:

**For bash** (add to `~/.bash_profile` or `~/.bashrc`):

```bash
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
```

**For zsh** (add to `~/.zshrc`):

```bash
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
```

**For fish** (add to `~/.config/fish/config.fish`):

```fish
set -gx PYENV_ROOT $HOME/.pyenv
set -gx PATH $PYENV_ROOT/bin $PATH
pyenv init - | source
```

Then reload your shell:

```bash
exec $SHELL
```

#### Step 4: Install Python 3.12

List available Python versions:

```bash
pyenv install --list | grep "3.12"
```

Install the latest 3.12 version:

```bash
pyenv install 3.12.0
```

Verify installation:

```bash
pyenv versions
```

#### Step 5: Create Virtual Environment

Navigate to the music_gen_service directory:

```bash
cd /path/to/music-gen/music_gen_service
```

Set local Python version (creates `.python-version` file):

```bash
pyenv local 3.12.0
```

Verify it's set:

```bash
python --version  # Should show Python 3.12.0
```

Create virtual environment:

```bash
python -m venv venv
```

Activate virtual environment:

```bash
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

---

### Linux Setup (Ubuntu/Debian)

#### Step 1: Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

#### Step 2: Install Build Dependencies

Once the process is complete, we can check the version of Python 3 that is installed in the system by typing:

```bash
python3 -V
```

You’ll receive output in the terminal window that will let you know the version number. While this number may vary, the output will be similar to this:

```bash
Python 3.8.10
```

#### Step 3: Install pyenv

```bash
curl https://pyenv.run | bash
```

#### Step 4: Configure Shell for pyenv

Add to your shell profile (`~/.bashrc` or `~/.zshrc`):

```bash
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
```

Reload shell:

```bash
source ~/.bashrc  # or ~/.zshrc
```

#### Step 5: Install Python 3.12

```bash
pyenv install 3.12.0
```

Verify:

```bash
pyenv versions
```

#### Step 6: Create Virtual Environment

Navigate to the service directory:

```bash
cd /path/to/music-gen/music_gen_service
```

Set local Python version:

```bash
pyenv local 3.12.0
```

Create virtual environment:

```bash
python -m venv venv
```

Activate:

```bash
source venv/bin/activate
```

## You should see `(venv)` in your terminal prompt.

### Windows Setup

#### Step 1: Install Git

Download and install from [git-scm.com](https://git-scm.com/)

#### Step 2: Install pyenv-win

Option A - Using Chocolatey (if installed):

```powershell
choco install pyenv-win
```

Option B - Manual installation:

```powershell
git clone https://github.com/pyenv-win/pyenv-win.git "$env:USERPROFILE\.pyenv"
```

Add to Environment Variables:

- Add `%USERPROFILE%\.pyenv\pyenv-win\bin` to PATH
- Add `%USERPROFILE%\.pyenv\pyenv-win\shims` to PATH

Restart PowerShell and verify:

```powershell
pyenv --version
```

#### Step 3: Install Python 3.12

```powershell
pyenv install 3.12.0
```

Verify:

```powershell
pyenv versions
```

#### Step 4: Create Virtual Environment

Navigate to service directory:

```powershell
cd C:\path\to\music-gen\music_gen_service
```

Set local Python version:

```powershell
pyenv local 3.12.0
```

Create virtual environment:

```powershell
python -m venv venv
```

Activate (PowerShell):

```powershell
.\venv\Scripts\Activate.ps1
```

Activate (Command Prompt):

```cmd
venv\Scripts\activate.bat
```

You should see `(venv)` in your terminal prompt.

## Installation

After completing Python setup and activating your virtual environment:

### Step 1: Install Python Dependencies

```bash
pip install --upgrade pip
```

```bash
pip install -r requirements.txt
```

Verify installation:

```bash
pip list
```

---

## Configuration

### Step 1: Set Up Modal Account

1. Go to [modal.com](https://modal.com)
2. Sign up for a free account
3. In your terminal, authenticate:

```bash
modal setup
```

This will open a browser to complete authentication. Follow the prompts.

### Step 2: Set Environment Variables

Follow the Cloudinary Setup Guide in the [Appendix](#appendix-cloudinary-setup-guide) to obtain your credentials. Then add the following to [Modal secrets](https://modal.com/apps/) under the `Secrets` tab, and include them in your `.env` file in the root directory:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Running the Service

### Deploy to Modal Cloud

```bash
# Ensure venv is activated
source venv/bin/activate  # macOS/Linux
# or
.\venv\Scripts\activate   # Windows

# deploy to modal
modal deploy main.py
```

This will:

- Deploy the service to Modal cloud
- Provide a public endpoint URL
- Make it accessible from anywhere
- copy the endpoint URL for use add add it to the `.env` file in the main as `GENERATE_SONG_URL`

---



## Troubleshooting

### Issue: `pyenv: command not found`

**Solution:** Shell not reloaded after pyenv installation.

```bash
# Restart your terminal or run:
exec $SHELL

# Or manually source:
source ~/.bashrc  # or ~/.zshrc
```

### Issue: `Python 3.12.0 not available`

**Solution:** Update pyenv and try again:

```bash
cd ~/.pyenv && git pull
pyenv install 3.12.0
```

### Issue: Virtual environment activation not working

**Solution:** Ensure you're in the correct directory:

```bash
cd /path/to/music-gen/music_gen_service
source venv/bin/activate  # macOS/Linux
# or
.\venv\Scripts\activate   # Windows
```

### Issue: `modal: command not found`

**Solution:** Modal is installed in venv. Ensure venv is activated:

```bash
# Activate venv first
source venv/bin/activate  # macOS/Linux

# Then run
modal --version
```

### Issue: `ImportError: No module named 'modal'`

**Solution:** Dependencies not installed. Run:

```bash
source venv/bin/activate  # Activate venv
pip install -r requirements.txt
```

### Issue: `Permission denied` when activating venv (macOS/Linux)

**Solution:** Make activation script executable:

```bash
chmod +x venv/bin/activate
source venv/bin/activate
```

### Issue: Modal authentication fails

**Solution:** Re-authenticate with Modal:

```bash
modal setup
```

For more information:

- [Modal Documentation](https://modal.com/docs)
- [LangChain Documentation](https://python.langchain.com/docs)
- [HuggingFace Models](https://huggingface.co/models)

---

## Appendix: Cloudinary Setup Guide <a name="appendix-cloudinary-setup-guide"></a>

This appendix provides step-by-step instructions for setting up Cloudinary for the Music Gen Service.

### Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/) and click **Sign Up for Free**
2. Complete registration with your email address
3. After verifying your email, log in to the **Cloudinary Console**

**Free Tier includes:**
- 25 GB managed storage
- 25 GB monthly net viewing bandwidth
- Sufficient for hundreds of songs, cover images, and videos

---

### Step 2: Find Your Credentials

1. In the Cloudinary Console, go to **Settings → API Keys** (or click the **Dashboard** icon)
2. Note down three values:
   - **Cloud name** — e.g. `mycloud`
   - **API Key** — e.g. `123456789012345`
   - **API Secret** — e.g. `abcdefghijklmnopqrstuvwxyz01`

**⚠️ SECURITY WARNING:**
- Never commit the API Secret to Git
- Store it in `.env` (which is git-ignored) and in Modal secrets

---

### Step 3: Configure Environment Variables

Add the following to your `.env` file in the root directory:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### Step 4: Configure Modal App Secrets

Navigate to [https://modal.com/apps/](https://modal.com/apps/), select the **Secrets** tab, and open (or create) the secret named `music_gen_secrets`. Add the following key-value pairs:

| Key                    | Value               |
| ---------------------- | ------------------- |
| CLOUDINARY_CLOUD_NAME  | your_cloud_name     |
| CLOUDINARY_API_KEY     | your_api_key        |
| CLOUDINARY_API_SECRET  | your_api_secret     |

Click **Save Changes**.

---

### How Assets Are Stored

All files are uploaded to a `music-gen/` folder in your Cloudinary account:

| Asset type | Resource type | Access      | Example public_id                        |
| ---------- | ------------- | ----------- | ---------------------------------------- |
| Cover art  | `image`       | Public      | `music-gen/550e8400-e29b`                |
| Thumbnail  | `image`       | Public      | `music-gen/7c9e6679-7425`                |
| Audio      | `raw`         | Authenticated | `music-gen/uuid_filtered_compressed.mp3` |
| Video      | `video`       | Authenticated | `music-gen/uuid_30fps`                   |

The NestJS server generates time-limited signed URLs for authenticated assets when needed (e.g. audio download, distribution processing).

---

### Troubleshooting Cloudinary Setup

#### Issue: "Must supply api_key" error

**Solution:** Ensure `CLOUDINARY_API_KEY` is set in the Modal secret and that the secret name is exactly `music_gen_secrets`.

#### Issue: "Invalid Signature" when accessing authenticated assets

**Solution:** Verify `CLOUDINARY_API_SECRET` is correct in both the server `.env` and Modal secrets. Signed URLs are time-limited (1 hour by default).

#### Issue: Upload fails with "File not found"

**Solution:** Confirm the local file path exists before upload. The `upload_to_cloudinary` function logs errors — check Modal function logs via `modal app logs music_gen_service`.

---

### References

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Python SDK](https://cloudinary.com/documentation/python_integration)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Modal Secrets](https://modal.com/docs/guide/secrets)
