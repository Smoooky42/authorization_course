import React, {useContext, useEffect, useState} from 'react';
import LoginForm from "./components/LoginForm";
import {Context} from "./index";
import {observer} from "mobx-react-lite";
import {IUser} from "./models/IUser";
import UserService from "./services/UserService";


function App() {
    const {store} = useContext(Context);
    const [users, setUsers] = useState<IUser[]>([]);

    useEffect(()=> {
        if (localStorage.getItem('token')) {
            store.checkAuth()
        }
    }, [])

    async function getUsers(){
        try {
            const response = await UserService.fetchUsers();
            setUsers(response.data);
        } catch (e) {
            console.log(e)
        }
    }

    if (store.isLoading) {
        return <div>Loading...</div>;
    }

    if (!store.isAuth) {
        return (
            <div>
                <h1>{'Авторизуйтесь'}</h1>
                <LoginForm/>
            </div>
        )
    }

    return (
        <div className="App">
            <h1>{`Пользователь авторизован ${store.user.email}`}</h1>
            <h1>{store.user.isActivated ? 'Аккаунт подтвержден по почте' : 'Подтвердите аккаунт!'}</h1>
            <button onClick={() => store.logout()}>Выйти</button>
            <div>
                <button onClick={getUsers}>Получить пользователей</button>
            </div>
            {users.map((user: IUser) =>
                <div key={user.email}>{user.email}</div>
            )}
        </div>
    );
}

export default observer(App);
