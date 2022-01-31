import React, { PureComponent } from 'react';
import { Dropdown, Loader, Segment, Icon, Popup } from 'semantic-ui-react';
import { BrowserRouter as Router } from 'react-router-dom';
import RenderSidebar from './RenderSidebar';
import ICDCLogo from './logo.svg';
import QuestionLogo from './question.svg';
import Burger from './burger.svg';
import './wrapper.scss';
import PropTypes from 'prop-types';
import auth from './auth';

class Wrapper extends PureComponent {
    constructor() {
        super();
        const userInfo = JSON.parse(localStorage.getItem('user'));
        this.state = {
            account: userInfo?.account,
            location: '',
            role: '',
            availableAccounts: null,
            visible: true,
            accountsDropdown: [],
            userInfo: null,
            accountsClass: false,
            rolesClass: false,
            langsClass: false
        };
    }

    errorTranslations = {
        ru: 'Сервис недоступен в этой локации. Пожалуйста, выберите другую.',
        en: 'The service is not available in this location. Please choose another location.'
    };

    langs = [{
        text: 'Русский',
        value: 'ru'
     },
     {
        text: 'English',
        value: 'en'
    }];

    DropdownIcon = (value, isPopup) => (
        <div style={{ display: 'inline-block', float: 'right' }}>
            <span style={{ marginRight: '4px', color: 'gray' }}>{value.toUpperCase()}</span>
            { isPopup ? (
                <Popup
                    content='Hello'
                    position='bottom left'
                    trigger={<Icon name='attention' className='location-popup' />}
                />
            ) : <Icon style={{ float: 'right', margin: 0, marginRight: '-8px' }} name="angle right"/> }
        </div>
    );

    componentDidMount() {
        const { availableAccounts } = this.state;
        const { id, changeAccounts, changeUser } = this.props;
        const libjwt = auth();
        libjwt.initPromise.then(() => {
            const { account, location, role } = JSON.parse(localStorage.getItem('user'));
            changeUser({ account, location, role });
            window.insights = {
                getToken: () => libjwt.jwt.getEncodedToken(),
                getUserInfo: () => libjwt.jwt.getUserInfo()
            }
            if (!availableAccounts) {
                const h = new Headers();
                h.append('Authorization', `Bearer ${libjwt.jwt.getEncodedToken()}`);
                fetch('https://api.zby.icdc.io/api/accounts/v1/accounts', {
                  method: 'GET',
                  headers: h
                }).
                then(response => response.json()
                .then(data => {
                    let newAccounts = {};
                    let accountsArray = [];
                    const userInfo = libjwt.jwt.getUserInfo();
                    console.log('eeeeeeeeeeeee')
                    console.log('response')
                    console.log(data)
                    console.log('userInfo')
                    console.log(userInfo)
                    console.log('eeeeeeeeeeeee')
                    const { accounts } = userInfo.external;
                    this.setState({ userInfo });
                    for (let obj in accounts) {
                        if (accounts[obj].locations.length && accounts[obj].roles.length) {
                            newAccounts[obj] = { ...accounts[obj] };
                        }
    
                    };

                    if (id === 'home') {
                        for (let obj in newAccounts) {
                            data.forEach(acc => {
                                if (obj === acc.name) {
                                    newAccounts[obj].locations = acc.locations;
                                    newAccounts[obj].display_name = acc.display_name;
                                    accountsArray.push({
                                        key: acc.name,
                                        text: acc.display_name,
                                        value: acc.name
                                    });
                                }
                            })
                        };
                    } else {
                        data.forEach(acc => {
                            acc.locations.forEach((location => {
                                location.services = location.services.filter(service => service.name === id);
                            }));
                            acc.locations = acc.locations.filter((location => location.services.length !== 0));
                        });
                        for (let obj in newAccounts) {
                            data
                            .filter(acc => acc.locations.length !== 0)
                            .forEach(acc => {
                                if (obj === acc.name) {
                                    newAccounts[obj].locations = acc.locations;
                                    newAccounts[obj].display_name = acc.display_name;
                                    accountsArray.push({
                                        key: acc.name,
                                        text: acc.display_name,
                                        value: acc.name
                                    });
                                }
                            });
                        };
                    }
                    console.log('rrrrrrrrrrrrr')
                    console.log('accountsArray')
                    console.log(accountsArray)
                    console.log('newAccounts')
                    console.log(newAccounts)
                    console.log('rrrrrrrrrrrrrr')
                    changeAccounts(newAccounts);
                    this.setState({
                        accountsDropdown: accountsArray,
                        availableAccounts: newAccounts,
                        account,
                        location,
                        role
                    });
                }));
            }
        });
    };

    componentDidUpdate(_prevProps, prevState) {
        const { account, availableAccounts, userInfo } = this.state;
        if (account && availableAccounts && prevState.account !== account) {
            this.setState({
                location: availableAccounts[account].locations[0].name,
                role: availableAccounts[account].roles[0]
            });
            localStorage.setItem('user', JSON.stringify({
                account,
                location: availableAccounts[account].locations[0].name,
                role: availableAccounts[account].roles[0],
                email: userInfo.email
            }));
        };
    };

    changeUserInfo = (name, value) => {
        const { account, location, role, userInfo } = this.state;
        const { changeUser } = this.props;
        this.setState({ [name]: value });
        changeUser({ account, location, role, [name]: value });
        localStorage.setItem('user', JSON.stringify({
            account, location, role, [name]: value, email: userInfo.email
        }))
    };

    setActiveClass = (name, value) => this.setState({ [name]: value });

    render() {
        const {
            availableAccounts,
            account,
            accountsDropdown,
            role,
            location,
            userInfo,
            visible,
            accountsClass,
            rolesClass,
            langsClass
        } = this.state;
        const {
            name,
            routes,
            locale,
            id,
            logout,
            changeLang,
            children,
            changeApp
        } = this.props;

        const roles = availableAccounts ? availableAccounts[account].roles.map(role => ({
            key: role,
            text: `${role}`,
            value: `${role}`
        })) : [];

        const locations = availableAccounts ? availableAccounts[account].locations.map(location => ({
            key: location.name,
            text: `${location.name}`,
            value: `${location.name}`
        })) : [];

        const isServiceAvailableInCurrantLocation = availableAccounts && Boolean([...locations].filter(currentLocation => currentLocation.value === location).length);

        const content = availableAccounts ? <>
            <header>
                { routes && <img src={Burger}
                                style={{ color: 'white', cursor: 'pointer' }}
                                onClick={ () => this.setState(prevState => ({ visible: !prevState.visible }))}
                                alt='Burger menu' /> }
                <img src={ ICDCLogo } alt="ICDCLogo"/>
                <div className='info-section'>
                    <Dropdown className='question-dropdown' icon={<img src={QuestionLogo} />}>
                        <Dropdown.Menu>
                            <Dropdown.Item>
                                <a href={`https://help.icdc.io/devops/${locale}/Welcome.html`} target='_blank' style={{ color: 'black' }}>
                                    Help & Asistance
                                </a>
                            </Dropdown.Item>
                            <Dropdown.Item>Support</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <label>
                        Location:
                        <Dropdown
                            fluid
                            selection
                            value={location}
                            onChange={(_e, data) => this.changeUserInfo('location', data.value)}
                            options={locations}
                        />
                    </label>
                    <Dropdown
                        text={userInfo.name}
                        className='user-dropdown'
                    >
                        <Dropdown.Menu className='first-level'>
                            <Dropdown.Header>{userInfo.email}</Dropdown.Header>
                            <Dropdown.Divider />
                            <Dropdown text='Accounts'
                                pointing='right'
                                // simple
                                className={(accountsClass ? 'active visible ' : '') + 'link item accounts'}
                                icon={this.DropdownIcon(account, true)}
                                // onMouseEnter={() => this.setActiveClass('accountsClass', true)}
                                // onMouseLeave={() => this.setActiveClass('accountsClass', false)}
                                // onChange={() => this.setActiveClass('accountsClass', false)}
                                closeOnChange
                            >
                                <Dropdown.Menu className={(accountsClass ? 'visible ' : '') + 'second-level'}>
                                    { accountsDropdown.map(account => (
                                        <Dropdown.Item key={account.key} onClick={() => this.setState({ account: account.value })}>
                                            {account.text}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                            { id !== 'devops' && <Dropdown text='Role'
                                pointing='right'
                                className={(rolesClass ? 'active visible ' : '') +  'link item'}
                                icon={this.DropdownIcon(role)}
                                onMouseEnter={() => this.setActiveClass('rolesClass', true)}
                                onMouseLeave={() => this.setActiveClass('rolesClass', false)}
                                onChange={() => this.setActiveClass('rolesClass', false)}
                                closeOnChange
                            >
                                <Dropdown.Menu className={(rolesClass ? 'visible ' : '') + 'second-level'}>
                                    {roles.map(role => (
                                        <Dropdown.Item key={role.value}
                                            onClick={() => this.changeUserInfo('role', role.value)}>
                                                {role.text}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown> }
                            <Dropdown.Divider />
                            <Dropdown text='Language'
                                pointing='right'
                                className={(langsClass ? 'active visible ' : '') +  'link item'}
                                icon={this.DropdownIcon(locale)}
                                onMouseEnter={() => this.setActiveClass('langsClass', true)}
                                onMouseLeave={() => this.setActiveClass('langsClass', false)}
                                onChange={() => this.setActiveClass('langsClass', false)}
                                closeOnChange
                            >
                                <Dropdown.Menu className={(langsClass ? 'visible ' : '') + 'second-level'}>
                                    {this.langs.map(lang => (
                                        <Dropdown.Item key={lang.value}
                                            onClick={() => changeLang(lang.value)}>
                                                {lang.text}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown.Item onClick={() => logout(true)}>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </header>
                { routes && isServiceAvailableInCurrantLocation && (
                    <RenderSidebar name={name}
                        routes={routes}
                        visible={visible}
                        changeApp={(newLocation) => changeApp(newLocation)}
                    />
                )}
                { isServiceAvailableInCurrantLocation ? (
                    <div className='main-content' style={{ paddingLeft: visible ? '290px' : '40px' }}>
                        {children}
                    </div>
                ) : <h2 className='unavailable'>{this.errorTranslations[locale]}</h2>
                } 
        </> : <Segment className='start-loader'>
        <Loader active inline='centered' />
    </Segment>;

    return <Router>{content}</Router>;
    }
};

Wrapper.propTypes = {
    id: PropTypes.string,
    changeAccounts: PropTypes.func,
    routes: PropTypes.array,
    locale: PropTypes.string,
    logout: PropTypes.func,
    changeLang: PropTypes.func
};

export default Wrapper;
