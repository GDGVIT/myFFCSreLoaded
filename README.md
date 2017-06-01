# myFFCSreLoaded
[Click here for demo](http://52.51.60.178:3000)

#ToDO:
1. Materialize.Toast not working after invalid login...There is <%=message%> for this in home.ejs (Harshit)
2. Include Venue and count of that course in the sidebar that opens up after selecting crscd and slot (Harshit)
3. Include count in suggested courses (Harshit)
4. Add the course to the table only if the STATUS is 200 after /validate. (Harshit)
5. Increase the width of crscd selection box (Harshit)


# API Reference:

`BaseUrl: http://52.51.60.178:3000`

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/dda3382cc211ec22cd2c)


### /getslot
```
request type: GET,
request query: {q:'<course_code>'}
success response:{response:'<slots>'}  STATUS:200
error response:{message:'error'} STATUS:500
```


### /getcourse
```
request type: GET,
request query: {courseCode:'<course_code>',slots:'<slot>'}
success response:{response:'<courses>'} STATUS:200
error response:{message:'error'} STATUS:500
```



### /validate
```
request type: POST,
request body: {courseId:'<courseId>'}
request headers: {token:"<mongo_uid>"}
success response:{'status':true} STATUS:200
error response:{'status':false} STATUS:500
```


### /deletecourse
```
request type: POST,
request body: {courseId:'<courseId>'}
request headers: {token:"<mongo_uid>"}
success response:{'status':true} STATUS:200
error response:{'status':false} STATUS:500
```

### /suggestcourse
```
request type: POST,
request body: {reg:'<mongo_uid>'}
success response:{message:true,data:"course and count of that batch"} STATUS:200
error response:{message:false} STATUS:500
```



### /detail
```
request type: GET,
request headers: {token:"<mongo_uid>"}
success response:{'status':true,'data':{'newAllotedCourse2':'<allCourses>'}} STATUS:200
error response:{'status':false,'data':{'newAllotedCourse2':[]}} STATUS:500
```



### /register
```
request type: POST,
request body: {name:'<name>',regno:'<regno>',password:'<password>',type:'mobile'}
success response:{status:"inserted"} STATUS:200
error response:{status:"error"} STATUS:500
```

### /login
```
request type: POST,
request body: {regno:'<regno>',password:'<password>'}
success response: STATUS:200
error response: STATUS:500
```

