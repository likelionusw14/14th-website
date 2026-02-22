"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const Login_1 = require("./components/Login");
const Dashboard_1 = require("./components/Dashboard");
function App() {
    const [userData, setUserData] = (0, react_1.useState)(null);
    const handleLoginSuccess = (data) => {
        setUserData(data);
    };
    const handleLogout = () => {
        setUserData(null);
    };
    return (<div className="font-sans antialiased">
            {userData ? (<Dashboard_1.Dashboard data={userData} onLogout={handleLogout}/>) : (<Login_1.Login onLoginSuccess={handleLoginSuccess}/>)}
        </div>);
}
exports.default = App;
