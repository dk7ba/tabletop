<template>
  <div id="app">
    <div id="game">
      <GameClient />
    </div>
    <div id="border"></div>
    <div id="input">
      <ChatClient />
    </div>
  </div>>
</template>

<script>
import ChatClient from './components/ChatClient.vue';
import GameClient from './components/GameClient.vue';

export default {
  name: 'App',
  components: {
    ChatClient,
    GameClient
  }
}
</script>

<style>
#app {
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  background-color: black;
  color: cyan;
  display: flex;
}

#game {
  width: 50vw;
  height: 100vh;
}

#input {
  width: 50vw;
  height: 100vh;
}

#border {
  border-right: 2px solid cyan;
}

@media (max-width: 1000px) {
  #app {
    flex-direction: column;
  }

  #game {
    width: 100vw;
    height: 50vh;
  }

  #input {
    width: 100vw;
    height: 50vh;
  }
   
}
</style>
