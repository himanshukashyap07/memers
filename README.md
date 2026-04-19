# App Name - memers

## Operations
    - user  
        - CURD operation on message: file(image) | imageText
        - see profile
            - avatar | username | email | allPosts
        - Update Password
    - admin
        - see all users or perform CURD operation on User
        - see all posts or see all posts of user or perform CURD operation on User post
        - admin dashboard Show analytics
## Features
    - CURD operition on posts
    - follow other users
    - likes and comments on the post
    - follow user

## models 

### user
    - username : unique,required,string,lowercase,trim,maxlength:25,index:true
    - email:unique,required,lowercase,trim,string
    - avatar:string,default:"guestImage"
    - password:string
    - isBlock:boolean
    - isVerified:boolean
    - refreshToken:string
    - verificationToken:sting
    - role -> [user,admin] default:user

### post
    - text:string,maxlength:250
    - userId:mongoose objectId,ref:"User"
    - url:string
    - hashtegs[]

### friends
    - userId:mongoose objectId,ref:"User"
    - friendId:mongoose objectId,ref:"User"
    - isFriend:boolean

### like
    - userId:mongoose objectId,ref:"User"
    - postId:mongoose objectId,ref:"Post"

### comments
    - userId:mongoose objectId,ref:"User"
    - postId:mongoose objectId,ref:"Post"
    - comment:string,maxlength:250words


# Backend

## user routes

        api's                |  method   |           description
    _________________________|___________|___________________________________    
    api/v1/registerUser      |   Post    |       save user in db
    api/v1/currentUser       |   Get     |       get current user
    api/v1/login             |   Post    |       create user session 
    api/v1/logout            |   Post    |       remove user session 
    api/v1/update            |   Patch   |       update user password or avatar
    api/v1/users             |   Get     |       get all users
    api/v1/blockUser         |   Patch   |       toggle block user
    api/v1/deleteUser        |   DELETE  |       delete user
    api/v1/getUserPost       |   Get     |       get current user post
    api/v1/userVerification  |   Post    |       check otp and marks as isVerfied:True


## post routes

        api's                |  method   |           description
    _________________________|___________|___________________________________    
    api/v1/createPost        |   Post    |       save post in db
    api/v1/getAllPosts       |   Get     |       get all post
    api/v1/updatePost        |   Patch   |       update text 
    api/v1/deletePost        |   DELETE  |       delete post
    
## friends

        api's                |  method   |           description
    _________________________|___________|___________________________________    
    api/v1/createFollow      |   Post    |       create followers
    api/v1/getFollowers      |   Get     |       all document that have friendId === currentUser
    api/v1/getFollowing      |   Get     |       all document that have userId === currebtUser
    api/v1/getfriends        |   Get     |       isFreind === true
    api/v1/FollowBack        |   Patch   |       update isFriend:true

## likes

        api's                |  method   |           description
    _________________________|___________|___________________________________    
    api/v1/createLike        |   Post    |       save Like in db
    api/v1/getAllLikes       |   Get     |       get all likes
    api/v1/toggleLike        |   Patch   |       toggleLike 
    api/v1/deleteLike        |   DELETE  |       delete Like

## comments

        api's                   |  method   |           description
    ____________________________|___________|___________________________________    
    api/v1/createComment        |   Post    |       save comment in db
    api/v1/getAllComment        |   Get     |       get all comment
    api/v1/updateComment        |   Patch   |       update comment
    api/v1/deleteCommnet        |   DELETE  |       delete comment


## api's algo

### user
    - api/v1/registerUser 
        - public api
        - save user as role user and when email is Equal to the Proccess.env.ADMIN_EMIAL than role become admin.
        - save user as isVerified False.
        - send a email to the user that have a verificationToken with a button that redirect user to the userVerification route and also save verificationToken in user document.
              e.g. verificationToken = bcrypt.hash(email+username)
                   save user isverified:false
                   sendVerificationEmail(verificationToken,email) \\ import from helper file 
        - return response user is create| verify user before login
    api/v1/currentUser  
        - private api
    api/v1/login   
        - public api
        - check user isverfied or not if not send a response verification has required 
    api/v1/logout       
        - private api
    api/v1/update
        -private api       
    api/v1/users
        - admin route (role:admin)        
    api/v1/blockUser    
        - admin route (role:admin)        
    api/v1/deleteUser   
        - admin route (role:admin)        
    api/v1/getUserPost
        - private route
        - get all post that have userId === currentUser._id
    api/v1/userVerification
        - public route 
        - find user by email
        - if user exist than isPasswordCorrect = await bcrypt.compare(user.varificationToken,email+user.username)
        - if isPassword is true than update user and save user as isVerified:true
### posts
    api/v1/createPost
        - from text get all word that start from the #
        - append all that type of words in hashteg array

### friends
    api/v1/createFollow 
        - private route
        - userId:currentUserId and friendId : another UserId
    api/v1/getFollowers 
        - all document that have friendId:currentUserId
    api/v1/getFollowing 
        - all documnet that have userId:currentUserId
    api/v1/getfriends
        - all documnet that have isFriend:true   
    api/v1/FollowBack
        - update isFriend:true