import { Footer } from '@/components';
import { login } from '@/services/ant-design-pro/api';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, history, SelectLang, useIntl, useModel, Helmet } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { createStyles } from 'antd-style';
import { request } from '@umijs/max';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});


const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('login');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      if (type === 'login') {
        const res = await request('http://localhost:3000/land/login', {
          method: "POST",
          data: {
            ...values,
          },
        });
        if (res && res.userid) {
          sessionStorage.setItem('user_info', JSON.stringify(res));
          await fetchUserInfo();

          const defaultLoginSuccessMessage = '登录成功！';
          message.success(defaultLoginSuccessMessage);  

          const urlParams = new URL(window.location.href).searchParams;
          history.push(urlParams.get('redirect') || '/');
          return;

        } else {
          setUserLoginState({
            status: 'error',
            type: 'login'
          });

          throw new Error(res.info);
        }

      } else {
        const res = await request('http://localhost:3000/land/resgiter', {
          method: "POST",
          data: {
            ...values,
            role: 'normal',
            boss: 'none'
          }
        })

        if (res && res.status === 'success') {
          message.success('注册成功！请登录');
          setType('login');

        } else {
          setUserLoginState({
            status: 'error',
            type: 'register'
          });

          throw new Error(res.info);
        }

      }
    } catch (error) {
      const defaultLoginFailureMessage = '请求失败，请重试！';
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          登录页
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          submitter={{ searchConfig: { submitText: type === 'login' ? '登录' : '注册' } }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Ant Design"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'login',
                label: '登录',
              },
              {
                key: 'register',
                label: '注册',
              },
            ]}
          />

          {status === 'error' && loginType === 'login' && (
            <LoginMessage
              content={"账户或密码错误"}
            />
          )}
          {type === 'login' && (
            <>
              <ProFormText
                name="user_id"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={"用户ID"}
                rules={[
                  {
                    required: true,
                    message: "请输入用户ID!",
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={"密码"}
                rules={[
                  {
                    required: true,
                    message: "请输入密码！",
                  },
                ]}
              />
            </>
          )}

          {status === 'error' && loginType === 'register' && <LoginMessage content="用户已存在!" />}
          {type === 'register' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="user_id"
                placeholder={"用户ID, 不可与其他用户重复"}
                rules={[
                  {
                    required: true,
                    message: "请输入用户ID",
                  },
                ]}
              />
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                name="name"
                placeholder={"用户昵称"}
                rules={[
                  {
                    required: true,
                    message: "请输入用户昵称",
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={"密码"}
                rules={[
                  {
                    required: true,
                    message: "请输入密码！",
                  },
                ]}
              />
            </>
          )}
          {type === 'login' &&
            <div
              style={{
                marginBottom: 24,
              }}
            >
              <ProFormCheckbox noStyle name="autoLogin">
                <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
              </ProFormCheckbox>
            </div>}
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
