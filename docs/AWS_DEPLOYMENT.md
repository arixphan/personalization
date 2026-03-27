# AWS Deployment Guide

> **Target audience:** Personal use only (1 user). Goal: learn AWS while keeping costs low.
> **Stack:** Next.js (frontend) · NestJS (backend) · PostgreSQL with pgvector · In-memory Redis (no ElastiCache needed)

---

## 💰 AWS Services & Cost Estimate

| Service | Config | Free Tier (12 months) | Monthly After Free Tier |
|---|---|---|---|
| **EC2** (NestJS backend) | t3.micro · 1 vCPU · 1GB RAM | ✅ 750 hrs/mo free | ~$8/mo |
| **RDS** (PostgreSQL 16) | db.t3.micro · 20GB gp2 | ✅ 750 hrs/mo free | ~$15/mo |
| **AWS Amplify** (Next.js frontend) | Hobby scale | ✅ 1000 build mins/mo free | ~$1–2/mo |
| **Route 53** (DNS) | 1 hosted zone | ❌ | $0.50/mo |
| **ACM** (SSL certificate) | — | ✅ Always free | Free |
| **ECR** (Docker image storage) | <1GB | ✅ 500MB free | ~$0.10/mo |
| **Data transfer** | Personal use | Partial | ~$1/mo |
| **Total** | | **~$0.50–2/mo** | **~$25–27/mo** |

> ⚠️ After the 12-month free tier expires, the main costs are EC2 (~$8) and RDS (~$15).

---

## 🏗️ Architecture

```
Internet
   │
Route 53 (your-domain.com)
   ├── app.your-domain.com  ──→  AWS Amplify  (Next.js SSR)
   └── api.your-domain.com  ──→  EC2 t3.micro
                                    │  Nginx (reverse proxy + HTTPS)
                                    │  NestJS :3000 (via PM2)
                                    │
                              RDS PostgreSQL 16
                              (private, same VPC)
```

---

## 📋 Step-by-Step Deployment

### Phase 1 — Prerequisites

#### Step 1: Create an AWS Account
1. Go to https://aws.amazon.com and sign up
2. Add a payment method (required even for free tier)
3. Choose the **us-east-1** region (cheapest & most services)

#### Step 2: Set Up IAM User (Do NOT use root account)
1. Go to **IAM → Users → Create user**
2. Name it `personalization-admin`
3. Attach policy: `AdministratorAccess` (for learning; restrict later)
4. Go to **Security credentials → Create access key** (CLI use case)
5. Save the `Access Key ID` and `Secret Access Key`

#### Step 3: Install AWS CLI Locally
```bash
brew install awscli
aws configure
# Enter: Access Key ID, Secret Access Key, region (us-east-1), format (json)
```

#### Step 4: Prepare Your GitHub Repo
- Make sure the repo is pushed to GitHub (Amplify needs it)
- Ensure `.env` files are in `.gitignore` ✅

---

### Phase 2 — Networking (VPC)

> AWS creates a default VPC — you can use it for learning. Skip custom VPC setup for now.

#### Step 5: Create a Security Group for EC2
1. Go to **EC2 → Security Groups → Create security group**
2. Name: `personalization-ec2-sg`
3. Add **Inbound rules:**
   | Type | Port | Source |
   |---|---|---|
   | SSH | 22 | Your IP only (My IP) |
   | HTTP | 80 | Anywhere (0.0.0.0/0) |
   | HTTPS | 443 | Anywhere (0.0.0.0/0) |

#### Step 6: Create a Security Group for RDS
1. Name: `personalization-rds-sg`
2. Add **Inbound rules:**
   | Type | Port | Source |
   |---|---|---|
   | PostgreSQL | 5432 | `personalization-ec2-sg` (only EC2 can connect) |

---

### Phase 3 — Database (RDS)

#### Step 7: Create RDS PostgreSQL Instance
1. Go to **RDS → Create database**
2. Settings:
   - Engine: **PostgreSQL 16**
   - Template: **Free tier**
   - DB instance identifier: `personalization-db`
   - Master username: `admin`
   - Master password: (save this securely)
   - Instance: `db.t3.micro`
   - Storage: `20 GiB gp2`
   - **Public access: No** (private)
   - Security group: `personalization-rds-sg`
3. Click **Create database** (takes ~5 min)

#### Step 8: Enable pgvector Extension
Once the EC2 is running and connected to RDS:
```bash
# SSH into EC2 first (see Phase 4), then:
psql -h <RDS_ENDPOINT> -U admin -d postgres
CREATE DATABASE personalization;
\c personalization
CREATE EXTENSION vector;
```

---

### Phase 4 — Backend (EC2)

#### Step 9: Launch EC2 Instance
1. Go to **EC2 → Launch instance**
2. Settings:
   - Name: `personalization-backend`
   - AMI: **Amazon Linux 2023** (free tier eligible)
   - Instance type: `t3.micro`
   - Key pair: Create new → `personalization-key` → download `.pem` file
   - Security group: `personalization-ec2-sg`
3. Launch the instance

#### Step 10: Allocate Elastic IP (Static IP)
1. Go to **EC2 → Elastic IPs → Allocate Elastic IP**
2. **Associate** it with your `personalization-backend` instance
3. Note the IP address — this is your static backend IP

#### Step 11: SSH Into EC2
```bash
chmod 400 ~/Downloads/personalization-key.pem
ssh -i ~/Downloads/personalization-key.pem ec2-user@<ELASTIC_IP>
```

#### Step 12: Install Dependencies on EC2
```bash
# Update system
sudo yum update -y

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
sudo yum install -y nginx

# Install git
sudo yum install -y git

# Install psql client (to run migrations)
sudo yum install -y postgresql15
```

#### Step 13: Create a Dockerfile for the Backend
Create `/Users/phandongho/dev/personal/personalization/backend/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main"]
```

#### Step 14: Deploy Backend to EC2
On your local machine:
```bash
# Build and push to ECR, OR just clone the repo on EC2

# On EC2 — clone your repo
git clone https://github.com/YOUR_USERNAME/personalization.git
cd personalization/backend

# Create .env file
nano .env
# Paste all your production env vars (see env vars section below)

# Install dependencies & build
pnpm install
pnpm build

# Run Prisma migrations
pnpm prisma migrate deploy

# Start with PM2
pm2 start dist/main.js --name personalization-backend
pm2 save
pm2 startup  # Follow the printed command to auto-start on reboot
```

#### Step 15: Configure Nginx as Reverse Proxy
```bash
sudo nano /etc/nginx/conf.d/personalization.conf
```

Paste:
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
sudo nginx -t  # Test config
```

#### Step 16: Set Up HTTPS with Let's Encrypt (Certbot)
```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
# Follow prompts — auto-renews every 90 days
```

---

### Phase 5 — Frontend (AWS Amplify)

#### Step 17: Deploy Next.js on Amplify
1. Go to **AWS Amplify → New app → Host web app**
2. Connect your **GitHub** repo
3. Select the repo and branch (`main`)
4. Build settings — Amplify auto-detects Next.js. Override if needed:
   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - npm install -g pnpm
               - cd frontend && pnpm install
           build:
             commands:
               - cd frontend && pnpm build
         artifacts:
           baseDirectory: frontend/.next
           files:
             - '**/*'
         cache:
           paths:
             - frontend/node_modules/**/*
   ```
5. Add **Environment variables** in Amplify console:
   ```
   SERVER_BASE_URL=https://api.your-domain.com/api
   JWT_SECRET=<your_production_jwt_secret>
   JWT_ACCESS_EXPIRATION_TIME=1800
   JWT_REFRESH_EXPIRATION_TIME=604800
   ```
6. Deploy — Amplify gives you a `https://xxxx.amplifyapp.com` URL

---

### Phase 6 — Domain & DNS (Route 53)

#### Step 18: Register or Transfer Domain
1. Go to **Route 53 → Registered domains**
2. Either register a new domain (~$12/year for `.com`) or transfer an existing one

#### Step 19: Create DNS Records
1. Go to **Route 53 → Hosted zones → your-domain.com**
2. Create records:
   | Name | Type | Value |
   |---|---|---|
   | `api` | A | `<EC2 Elastic IP>` |
   | `app` | CNAME | `<Amplify domain>.amplifyapp.com` |

#### Step 20: Add Custom Domain to Amplify
1. In Amplify console → **Domain management → Add domain**
2. Enter `your-domain.com`
3. Set subdomain: `app.your-domain.com`
4. Amplify auto-provisions an ACM SSL certificate ✅

---

### Phase 7 — Production Environment Variables

#### Backend `.env` (on EC2)
```env
DATABASE_URL="postgresql://admin:<PASSWORD>@<RDS_ENDPOINT>:5432/personalization?schema=public"
JWT_SECRET=<strong_random_secret_min_64_chars>
JWT_ACCESS_EXPIRATION_TIME=1800000
JWT_REFRESH_EXPIRATION_TIME=604800000
BCRYPT_SALT_ROUNDS=12

GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>

PORT=3000
BACKEND_URL=https://api.your-domain.com/api
FRONTEND_URL=https://app.your-domain.com

OPENAI_API_KEY=<your_openai_key>
GOOGLE_GENERATIVE_AI_API_KEY=<your_google_ai_key>
ENCRYPTION_KEY=<64_char_hex_key>
```

> 💡 **Tip:** Use `openssl rand -hex 32` to generate strong secrets.

---

### Phase 8 — Ongoing Maintenance

#### Deploying Updates (Backend)
```bash
# SSH into EC2
ssh -i ~/Downloads/personalization-key.pem ec2-user@<ELASTIC_IP>

cd personalization
git pull origin main
cd backend
pnpm install
pnpm build
pnpm prisma migrate deploy
pm2 restart personalization-backend
```

#### Deploying Updates (Frontend)
Amplify auto-deploys on every push to `main` branch. Nothing to do! ✅

#### Monitoring
- **EC2 metrics:** CloudWatch (CPU, memory, network) — free basic tier
- **RDS metrics:** CloudWatch automatically
- **PM2 logs:** `pm2 logs personalization-backend`
- **Nginx logs:** `sudo tail -f /var/log/nginx/error.log`

---

## ✅ Deployment Checklist

- [ ] AWS account created & IAM user set up
- [ ] AWS CLI configured locally
- [ ] Security groups created (EC2 + RDS)
- [ ] RDS PostgreSQL 16 instance running
- [ ] `pgvector` extension enabled on RDS
- [ ] EC2 instance launched with Elastic IP
- [ ] Node.js, pnpm, PM2, Nginx installed on EC2
- [ ] Backend cloned, built, and running with PM2
- [ ] Nginx configured as reverse proxy
- [ ] HTTPS enabled via Certbot (Let's Encrypt)
- [ ] Frontend deployed on AWS Amplify
- [ ] Domain registered in Route 53
- [ ] DNS records pointing to EC2 (api) and Amplify (app)
- [ ] Custom domain added to Amplify with SSL
- [ ] All production env vars set
- [ ] PM2 startup script configured (auto-restart on reboot)

---

## 📚 Useful Commands Reference

```bash
# SSH into EC2
ssh -i ~/Downloads/personalization-key.pem ec2-user@<ELASTIC_IP>

# PM2 commands
pm2 list                          # List all processes
pm2 logs personalization-backend  # View logs
pm2 restart personalization-backend
pm2 stop personalization-backend

# Nginx commands
sudo nginx -t                     # Test config
sudo systemctl reload nginx       # Reload without downtime
sudo systemctl status nginx

# Check Prisma migration status
cd ~/personalization/backend
pnpm prisma migrate status

# Generate a secure secret
openssl rand -hex 32              # 64-char hex string
openssl rand -base64 48           # 64-char base64 string
```
