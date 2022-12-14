import React, {useState, useEffect} from 'react';
import {Route, Switch, useHistory} from "react-router-dom"
import './App.css';
import Home from './Home'
import NavBar from './NavBar';
import Category from './Category';
import Login from './Login';
import NewPost from './NewPost';

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [createNew, setCreateNew] = useState(false)
  const [posts, setPosts] = useState({
    read: null,
    watch: null,
    listen: null
  })
  const history = useHistory()

  useEffect(()=>{
    fetch(`http://localhost:3000/posts/`, {
      method: "GET",
      headers: {
        "Content-Type": "Application/json"
      }
    })
    .then(res=>res.json())
    .then(data=>{
      const updatedPosts = {
        read: [],
        watch: [],
        listen: []
      }
      data.map(post=>{
        updatedPosts[post.type].push(post)
      })
      setPosts(updatedPosts)
    })
  }, [])

  function handleLogIn(userInfo){
    fetch(`http://localhost:3000/users/`, {
      method: "GET",
      headers: {
        "Content-Type": "Application/json"
      }
    })
    .then(res=>res.json())
    .then(data=>{
      const userData = data.filter(user=>user.username === userInfo.username)
      if (userData.length === 0) alert(`Username ${userInfo.username} does not exist. Please try again or create an account.`)
      else if (userInfo.username !== userData[0].username || userInfo.password !== userData[0].password) {
        alert("Incorrect username/password combo. Please try again or create an account.")}
      else if (userInfo.username === userData[0].username && userInfo.password === userData[0].password){
        setCurrentUser(userData[0].username)
        history.push("/")
      }
    })
  }

  function handleCreateAccount(newUser){
    fetch(`http://localhost:3000/users/`, {
      method: "GET",
      headers: {
        "Content-Type": "Application/json"
      }
    })
    .then(res=>res.json())
    .then(data=>{
      const userData = data.filter(user=>user.username === newUser.username)
      if (userData.length !== 0) alert(`Username ${newUser.username} already taken. Please select a different username.`)
      else{
        fetch(`http://localhost:3000/users/`, {
          method: "POST",
          headers: {
            "Content-Type": "Application/json"
          },
          body: JSON.stringify(newUser)
        })
        .then(res=>res.json())
        .then(data=>{
          console.log("account created", data)
        })
        }
    })
  }

  function updateLikes(postId, newLikeCount, type){
    const likeUpdate = {likes: newLikeCount}
    fetch(`http://localhost:3000/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(likeUpdate)
    })
    .then(res=>res.json())
    .then(data=>{
      const postUpdate = posts[type].map(post=>{
        if (post.id === postId){
          return {
            ...post,
            likes: data.likes
          }
        }else return post
      })
      setPosts({
        ...posts,
        [type]: postUpdate
      })
    })
  }

  function createPost(newPost){
    fetch(`http://localhost:3000/posts/`, {
          method: "POST",
          headers: {
            "Content-Type": "Application/json"
          },
          body: JSON.stringify(newPost)
        })
        .then(res=>res.json())
        .then(data=>{
          const type = data.type
          console.log("postCreated", data);
          setPosts({
            ...posts,
            [type]: [...posts[type], data]
          })
        })
    setCreateNew(false)
  }

  function createComment(newCommentList, id, type){
    console.log("attempting" )
    fetch(`http://localhost:3000/posts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({comments: newCommentList})
    })
    .then(res=>res.json())
    .then(data=>{
      const update = posts[type].map((post)=>{
        if (post.id === id){
          return({
            ...post,
            comments: data.comments
          })
        }else return post
      });
      setPosts({
        ...posts,
        [type]: update
      })
    })
  }

  return (
    <div className="App">
      <h1>Steven's Picks</h1>
      <NavBar currentUser={currentUser} setCurrentUser={setCurrentUser} />
      {currentUser && !createNew ? <button id='createNewButton' onClick={()=>setCreateNew(true)}><a className='createNew navLinks'>Create New</a></button> : <></> }
      {createNew ? <NewPost setCreateNew={setCreateNew} currentUser={currentUser} createPost={createPost}/> : <></>}
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/read">
          <Category posts = {posts.read} heading="READ" updateLikes={updateLikes} currentUser={currentUser} createComment={createComment} />
        </Route>
        <Route exact path="/watch">
          <Category posts = {posts.watch} heading="WATCH" updateLikes={updateLikes} currentUser={currentUser} createComment={createComment} />
        </Route>
        <Route exact path="/listen">
          <Category posts = {posts.listen} heading="LISTEN" updateLikes={updateLikes} currentUser={currentUser} createComment={createComment} />
        </Route>
        <Route exact path="/login">
          <Login handleLogIn={handleLogIn} handleCreateAccount={handleCreateAccount} />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
