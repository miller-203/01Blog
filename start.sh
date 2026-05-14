#start backend 
cd backend
./mvnw clean spring-boot:run &
#start frontend
cd ../frontend
ng serve


export $(grep -v '^#' .env | xargs)
./mvnw spring-boot:run