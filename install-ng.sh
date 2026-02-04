curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zshrc
nvm --version
nvm install --lts
nvm use --lts
node -v
npm -v
npx -v
cd frontend
npm install @angular/cli --save-dev
npx ng serve
