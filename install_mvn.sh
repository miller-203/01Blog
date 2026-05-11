wget https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz
tar -xzf apache-maven-3.9.9-bin.tar.gz
echo 'export MAVEN_HOME=$HOME/apache-maven-3.9.9' >> ~/.zshrc
echo 'export PATH=$MAVEN_HOME/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
mvn -version
ls ~ | grep maven