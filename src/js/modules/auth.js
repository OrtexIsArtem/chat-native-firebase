import firebase from 'firebase/app'
import 'firebase/auth'
import {getUrlHash, removeNode, renderInDocument, setLocation} from './utils'
import {updateUser} from './userSettings';

const createModalAuth = isRegister => {
  const $el = document.createElement('aside')
  const options = isRegister
    ? {
      title: 'Регистрация',
      forwarding: 'Уже есть аккаун?',
      register: true
    }
    : {
      title: 'Вход',
      forwarding: 'Создать аккаунт'
    }

  $el.innerHTML = `
    <aside class="text-center form-signin">
      <form class="sin-in-form">
        <h3 class="h3 mb-3 fw-normal">${options.title}</h3>
        ${options.register ? `
          <label for="inputName" class="invisible sr-only">Имя</label>
          <input type="text" id="inputName" class="form-control" placeholder="Имя" required autofocus>
        ` : ''}
        <label for="inputEmail" class="invisible sr-only">Email</label>
        <input type="email" id="inputEmail" class="form-control" placeholder="Email" required autofocus>
        <label for="inputPassword" class="invisible sr-only">Password</label>
        <input type="password" id="inputPassword" class="form-control" placeholder="Password" required>
        <button class="w-100 btn btn-lg btn-primary btn-auth" type="submit">Войти</button>
        <a href="#" class="forwarding-link">${options.forwarding}</a>
      </form>
    </aside>
    `
  return {
    node: $el
  }
}


const authEmailAndPassword = async (email, password, username, isRegister) => {
  try {
    if (isRegister) {
      const userData = await firebase.auth().createUserWithEmailAndPassword(email, password)
      const user = userData.user

      await user.updateProfile({
        photoURL: `https://via.placeholder.com/150`,
        displayName: username || 'user'
      })
      await updateUser(user, username, `https://via.placeholder.com/150`, 'Нет информации')
      window.location.reload()
      return
    }
    const userData = await firebase.auth().signInWithEmailAndPassword(email, password)
    setLocation('/')
  } catch (e) {
    console.error(e)
  }
}

export const auth = () => {
  let isRegister = getUrlHash() === '#register'
  renderInDocument(createModalAuth(isRegister))
  let form = document.querySelector('.sin-in-form')

  const handleAuth = (e) => {
    e.preventDefault()
    const email = document.querySelector('#inputEmail').value
    const password = document.querySelector('#inputPassword').value
    const name = document.querySelector('#inputName')?.value || {value: ''}

    authEmailAndPassword(email, password, name, isRegister)
      .then(() => {
        form.removeEventListener('submit', handleAuth)
        removeNode('.form-signin')
      })

  }


  document.body.addEventListener('click', e => {
    if (e.target.closest('.forwarding-link')) {
      e.preventDefault()
      form.removeEventListener('submit', handleAuth)
      removeNode('.form-signin')
      isRegister = !isRegister
      setLocation(isRegister ? '#register' : '#login')
      renderInDocument(createModalAuth(isRegister))
      form = document.querySelector('.sin-in-form')
      form.addEventListener('submit', handleAuth)
    }
  })

  form.addEventListener('submit', handleAuth)

}
