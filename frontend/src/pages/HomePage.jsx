import {Link} from 'react-router-dom' // imports the Link component from the lib

// Declares a component named HomePage
function HomePage() {
    // everything inside the return is the JSX that gets rendered to the actual page
    return (
        <div>
            {/*a simple heading element */}
            <h1>
                Welcome to the Bank
            </h1>
            {/*a clickable link. to="/create-account" is the URL path it will navigate to when clciked*/}
            <Link to="/create-account"> 
                {/*the visible text on the link*/}
                Create Account 
            </Link>
            <Link to="/account">
                View Account
            </Link>
        </div>
    )
}

// makes this component available to be imported elsewhere 
export default HomePage