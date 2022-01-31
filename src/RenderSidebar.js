import React from 'react';
import { withRouter } from 'react-router-dom';
import { Sidebar, Menu } from 'semantic-ui-react';
import Home from './home.svg';

class RenderSidebar extends React.Component {
    splitAndGet = (string) => string.split('/')[1];

    state = {
        activeItem: this.splitAndGet(this.props.history.location.pathname)
    };

    changeItem = (route) => {
        const { changeApp } = this.props;
        this.setState({ activeItem: this.splitAndGet(route) });
        changeApp(route);
    };

    componentDidMount() {
        const { routes } = this.props;
        if (!routes.find(route => this.splitAndGet(route.to) === this.state.activeItem)) {
            this.setState({ activeItem: this.splitAndGet(routes[0].to) });
        }
    };

    render() {
        const { name, routes, visible } = this.props;
        const { activeItem } = this.state;

        return (
        <Sidebar as={Menu} visible={visible} animation='overlay' vertical inverted style={{ overflow: 'hidden' }}>
            <Menu inverted className='sidebar_top'>
                <Menu.Item className='sidebar_home_link'>
                    <a href='https://icdc.io/' target='_blank'>
                        <img src={Home} alt='Home' />
                    </a>
                </Menu.Item>
                <Menu.Item className='sidebar_logo_text' style={{ color: 'white' }}>
                    { name }
                </Menu.Item>
            </Menu>
            { routes.map((route, key) =>
                <div
                    key={key}
                    onClick={() => this.changeItem(route.to)}
                    className={ (activeItem === this.splitAndGet(route.to) ? 'active ' : '') + 'item'}
                    style={{ fontSize: '15px', cursor: 'pointer' }}>
                    {route.title}
                </div>
            )}
        </Sidebar>
        )
    }
};

export default withRouter(RenderSidebar);
