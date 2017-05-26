# myFFCSreLoaded
[Click here for demo](https://myffcs.herokuapp.com/)


# ToDo's:
```
  a. Forgot passwd.
  b. Download and share.
```


#API Reference:

`BaseUrl: https://myffcs.herokuapp.com/`

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
request headers: {token:"<regno>"}
success response:{'status':true} STATUS:200
error response:{'status':false} STATUS:500
```


### /deletecourse
```
request type: POST,
request body: {courseId:'<courseId>'}
request headers: {token:"<regno>"}
success response:{'status':true} STATUS:200
error response:{'status':false} STATUS:500
```

### /suggestcourse
```
request type: POST,
request body: {reg:'<registerNo>'}
success response:{message:true,data:"course and count of that batch"} STATUS:200
error response:{message:false} STATUS:500
```



### /detail
```
request type: GET,
request headers: {token:"<regno>"}
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

