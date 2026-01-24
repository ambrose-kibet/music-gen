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
- [Appendix: AWS Setup Guide](#appendix-aws-setup-guide)

---

## Overview

The Music Gen Service is a serverless microservice that handles AI music generation, cover art creation, and video processing. It runs on Modal (a serverless platform) and processes requests from the main NestJS server via BullMQ job queue.

**Key Components:**

- `main.py` - FastAPI endpoint for music generation requests
- `ai_service.py` - Multi-step AI workflow orchestration with LanGraph with HuggingFace models
- `ace_step_service.py` - Core AI music generation using AceStep model
- `video_ai_service.py` - Video generation and processing
- `utils.py` - Helper functions for S3 uploads, file handling, etc.
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
        ┌────────▼────────┐
        │  AWS S3 Bucket  │
        │ (Audio, Cover,  │
        │  Videos, etc)   │
        └─────────────────┘
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

- AWS S3 credentials (for file uploads)
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

Follow the AWS Setup Guide in the [Appendix](#appendix-aws-setup-guide) to create an S3 bucket and IAM user. Then,add the following content to [modal secrets](https://modal.com/apps/) under the `Secrets` tab and also include the following secrets to your `.env` file in the root directory:

```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=music-gen-bucket

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

## Appendix: AWS Setup Guide <a name="appendix-aws-setup-guide"></a>

This appendix provides step-by-step instructions for setting up AWS S3 for the Music Gen Service, including account creation, bucket setup, and IAM policy configuration.

### Step 1: Sign Up for a Free AWS Account

#### Prerequisites

- Valid email address
- Credit/debit card (AWS Free Tier does NOT require charges, but a valid card is needed for verification)
- Phone number for verification

#### Account Creation Steps

1. **Visit AWS Sign-Up Page**
   - Go to [https://aws.amazon.com/](https://aws.amazon.com/)
   - Click **Create an AWS Account** in the top-right corner

2. **Enter Email and Create Password**
   - Enter a valid email address
   - Create a strong password
   - Confirm password
   - Click **Continue**

3. **Choose Account Type**
   - Select **Personal** (for individual use)
   - Fill in your contact information:
     - Full Name
     - Phone Number
     - Country
     - Address
     - City, State/Province, Postal Code
   - Accept AWS Customer Agreement
   - Click **Continue**

4. **Billing Information**
   - Enter valid payment method details
   - Select **Debit or Credit Card**
   - Fill in:
     - Card number
     - Expiration date
     - CVV
     - Name on card
   - Click **Verify and Add**
   - AWS will charge ~$1 USD and immediately refund it (for verification)

5. **Phone Verification**
   - Receive a verification code via SMS or phone call
   - Enter the code when prompted
   - Click **Verify Code**

6. **Choose AWS Support Plan**
   - Select **Basic Plan** (free)
   - Click **Complete Sign Up**

7. **Confirm Email**
   - Check your email for AWS confirmation
   - Click the confirmation link
   - You're now signed up! Click **Go to AWS Console**

**Free Tier Benefits:**

- 5GB free S3 storage per month for 12 months
- Free data transfer within same region
- Full access to AWS services with usage limits

---

### Step 2: Create an S3 Bucket

#### Accessing S3 Console

1. **Sign In to AWS Console**
   - Go to [https://aws.amazon.com/console/](https://aws.amazon.com/console/)
   - Enter your email and password

2. **Navigate to S3**
   - Click **Services** in the top-left
   - Search for **S3** (Simple Storage Service)
   - Click **S3** from the results

#### Creating a Bucket

1. **Click Create Bucket**
   - In the S3 console, click the **Create bucket** button

2. **Configure Bucket Details**

   **Bucket name:**
   - Must be globally unique (no other AWS account can have same name)
   - Use lowercase letters and hyphens
   - No underscores or periods
   - Example: `music-gen-bucket-12345` (add your unique ID)
   - Length: 3-63 characters

   **AWS Region:**
   - Select a region close to your users
   - Common choices:
     - `us-east-1` (N. Virginia) - most services
     - `eu-west-1` (Ireland) - Europe
     - `ap-southeast-1` (Singapore) - Asia
   - For this guide, we'll use `us-east-1`

3. **Block Public Access Settings**
   - **IMPORTANT:** Keep all "Block Public Access" options **checked**
   - This prevents accidental public exposure of your music files
   - Your bucket will remain private

4. **Bucket Versioning (Optional)**
   - Leave **Versioning** disabled for now
   - Can be enabled later if you need version history

5. **Click Create Bucket**
   - Review your settings
   - Click **Create bucket** button
   - You should see confirmation: "Successfully created bucket"

#### Verify Bucket Creation

Your new bucket should appear in the S3 buckets list:

```
Bucket name: music-gen-bucket-12345
Region: us-east-1
Creation date: [current date]
```

#### Configure S3 Bucket Public Access

**Important:** By default, AWS blocks all public ACLs on S3 buckets for security. If your Music Gen Service needs to serve files publicly (e.g., cover art and video thumbnails), you must explicitly allow public access.

#### Allow Public Access

1. **Open S3 Console**
   - Go to [https://s3.console.aws.amazon.com/](https://s3.console.aws.amazon.com/)
   - Sign in to your AWS account

2. **Select Your Bucket**
   - Click on `music-gen-bucket-12345` (your bucket name)

3. **Navigate to Permissions**
   - Click the **Permissions** tab

4. **Modify Block Public Access Settings**
   - Scroll to **Block public access (bucket settings)**
   - Click **Edit**
   - Uncheck **Block all public access** (if you need public files)
   - **⚠️ Warning:** You'll see a confirmation dialog

5. **Confirm Changes**
   - Read the warning carefully
   - Type `confirm` in the text field
   - Click **Confirm**
   - Settings are now updated

Your application code can set ACLs during upload:

```python
s3_client.put_object(
     Bucket=bucket_name,
     Key=object_key,
     Body=file_content,
     ACL='public-read'  # Now this will actually take effect
)
```

---

### Step 3: Create an IAM User with S3 Permissions

**Why IAM User?** Never use AWS root account credentials. IAM users provide granular permission control and can be disabled without affecting your main account.

#### Access IAM Console

1. **Navigate to IAM**
   - Click **Services** in the top-left
   - Search for **IAM** (Identity and Access Management)
   - Click **IAM**

2. **Create New User**
   - In the left sidebar, click **Users**
   - Click **Create user** button

#### Configure User

1. **User Details**
   - User name: `music-gen-service` (or your preferred name)
   - Click **Next**

2. **Set Permissions**
   - Select **Attach policies directly**
   - Do NOT use predefined policies yet (we'll create a custom one)
   - Click **Next**

3. **Review and Create**
   - Review settings
   - Click **Create user**
   - User created successfully!

#### Create Custom IAM Policy

1. **Create Policy**
   - In left sidebar, click **Policies**
   - Click **Create policy** button

2. **Choose Policy Editor**
   - Select **JSON** tab
   - Paste the following policy (replace `music-gen-bucket-12345` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::music-gen-bucket-12345"
    },
    {
      "Sid": "GetObjectFromBucket",
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::music-gen-bucket-12345/*"
    },
    {
      "Sid": "PutObjectToBucket",
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::music-gen-bucket-12345/*"
    },
    {
      "Sid": "DeleteObjectFromBucket",
      "Effect": "Allow",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::music-gen-bucket-12345/*"
    },
    {
      "Sid": "GetObjectACL",
      "Effect": "Allow",
      "Action": "s3:GetObjectAcl",
      "Resource": "arn:aws:s3:::music-gen-bucket-12345/*"
    },
    {
      "Sid": "PutObjectACL",
      "Effect": "Allow",
      "Action": "s3:PutObjectAcl",
      "Resource": "arn:aws:s3:::music-gen-bucket-12345/*"
    }
  ]
}
```

**Policy Breakdown:**

- `ListBucket`: List files in the bucket (required for uploads)
- `GetObject`: Download files from the bucket
- `PutObject`: Upload files to the bucket
- `DeleteObject`: Delete files from the bucket
- `GetObjectAcl`: Read object permissions
- `PutObjectAcl`: Set object permissions

3. **Review Policy**
   - Click **Next**
   - Policy name: `music-gen-s3-access`
   - Description: "Allow Music Gen service to read/write to S3 bucket"
   - Click **Create policy**

#### Attach Policy to User

1. **Go Back to Users**
   - Click **Users** in left sidebar
   - Click on **music-gen-service** user

2. **Add Permissions**
   - Click **Add permissions** dropdown
   - Select **Attach policies directly**

3. **Select Policy**
   - Search for `music-gen-s3-access`
   - Check the checkbox next to the policy name
   - Click **Next**

4. **Review and Confirm**
   - Review permissions
   - Click **Attach policies**
   - Success! Policy is now attached

---

### Step 4: Generate Access Keys

**Access Keys** consist of an Access Key ID and Secret Access Key used to authenticate API calls.

#### Create Access Keys

1. **Go to User**
   - In IAM console, click **Users**
   - Click **music-gen-service** user

2. **Create Access Key**
   - Click on **Security credentials** tab
   - Scroll to **Access keys** section
   - Click **Create access key**

3. **Choose Use Case**
   - Select **Application running outside AWS**
   - Click **Next**

4. **Set Description**
   - Description: `Music Gen Service S3 Access`
   - Click **Create access key**

5. **Save Credentials**
   - **IMPORTANT:** Copy these values immediately - they only appear once!
   - Access Key ID: (looks like `AKIAIOSFODNN7EXAMPLE`)
   - Secret Access Key: (looks like `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
   - Add the keys to your `.env` file:

```bash
AWS_ACCESS_KEY=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

- Click **Done**

**⚠️ SECURITY WARNING:**

- Never commit these keys to Git or public repositories
- Never share these credentials
- Treat them like passwords
- Store in `.env` file (which is git-ignored)

#### Download Credentials (Alternative)

If you missed copying:

1. Go back to Security credentials tab
2. Under Access keys, you can see your Access Key ID
3. Click **Show** to reveal the Secret Access Key (if not yet hidden)

---

### Step 5: Configure Music Gen Service

Now that you have AWS credentials and an S3 bucket, configure the Music Gen Service:

#### Update `.env` File

Create or update `.env` in the `music_gen_service` directory:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_BUCKET_NAME=music-gen-bucket-12345
```

#### Update Modal App Secrets

Navigate to your Modal dashboard:[https://modal.com/apps/](https://modal.com/apps/)
Select the `Secrets` tab.
Click the `create new secret` button on the top right.
Choose `Custom` .
Name the secret `music_gen_secrets` and add the following key-value pairs:

| Key                   | Value                  |
| --------------------- | ---------------------- |
| AWS_ACCESS_KEY_ID     | AKIAIOSFODNN7EXAMPLE   |
| AWS_SECRET_ACCESS_KEY | wJalrXUtnFEMI/...      |
| AWS_REGION            | us-east-1              |
| AWS_BUCKET_NAME       | music-gen-bucket-12345 |

**Replace values:**

- `AKIAIOSFODNN7EXAMPLE` → Your Access Key ID
- `wJalrXUtnFEMI/...` → Your Secret Access Key
- `music-gen-bucket-12345` → Your bucket name
- `us-east-1` → Your chosen region
- Click `Save Changes` to save.

### Step 6: Manage Your AWS Account

#### Monitor Costs

1. **Enable Billing Alerts**
   - Go to **Billing Dashboard**
   - Click **Billing preferences**
   - Check "Receive Free Tier Usage Alerts"
   - Check "Receive Billing Alerts"
   - Set alert threshold: $5 USD

2. **View Usage**
   - Go to **AWS Billing Dashboard**
   - See current month's charges
   - Forecast for the month

#### Best Practices

- **Use IAM Users** - Never use root account credentials
- **Enable MFA** - Multi-factor authentication on root account
- **Rotate Keys** - Regularly delete old and create new access keys
- **Use Bucket Policies** - Control who can access your bucket
- **Enable Logging** - Track access to your files
- **Set Lifecycle Rules** - Automatically delete old objects

#### Lifecycle Rule Example (Auto-Delete Old Files)

1. **Go to S3 Bucket**
   - Click on your bucket name
   - Click **Lifecycle rules** tab
   - Click **Create lifecycle rule**

2. **Configure Rule**
   - Rule name: `delete-old-music`
   - Scope: Apply to all objects in bucket
   - Actions: Permanently delete previous versions after 30 days
   - Click **Create rule**

---

### Troubleshooting AWS Setup

#### Issue: "Access Denied" when uploading to S3

**Solution:**

1. Verify IAM user has correct policy attached
2. Check access keys are correct in `.env`
3. Verify bucket name matches exactly
4. Ensure bucket is not set to block all public uploads (should be blocked for security)

#### Issue: "InvalidBucketName" error

**Solution:**
Bucket names must:

- Be globally unique across all AWS accounts
- Use only lowercase letters, numbers, and hyphens
- Start and end with letter or number
- Be 3-63 characters long

#### Issue: Bucket already exists in different account

**Solution:**
Add a unique suffix to your bucket name:

```
music-gen-bucket-12345-abc123xyz
```

---

### Free Tier Limits (As of 2026)

AWS Free Tier includes:

- **5 GB** S3 standard storage per month
- **20,000** GET requests per month
- **2,000** PUT requests per month
- **Data transfer**: Free within same region
- **Data transfer**: $0.09/GB when leaving region

**Estimate:**

- 100 songs at 5MB each = 500MB (within free tier)
- 10 covers art at 1MB each = 50MB (within free tier)
- 100 videos at 1MB each = 100MB (within free tier)

---

### References

- [AWS Free Tier Documentation](https://aws.amazon.com/free/)
- [S3 Getting Started](https://docs.aws.amazon.com/s3/index.html)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [S3 Access Control](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-overview.html)
- [Boto3 S3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html)
