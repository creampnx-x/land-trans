import { PageContainer, ProDescriptions, ProList } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, Drawer, Progress, Tag, message, theme } from 'antd';
import React, { useEffect, useState } from 'react';
import { formatDateTime, statusMap } from './Transaction';
import TransactionInfo from './TransactionInfo';
import LandDescription from './LandDescription';
import { getAllTransactionList, getLand } from '@/services/request';
// import { getLandInfo } from './Admin';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href: string;
}> = ({ title, href, index, desc }) => {
  const { useToken } = theme;

  const { token } = useToken();

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              "url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')",
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
      {/* <a href={href} target="_blank" rel="noreferrer">
        了解更多 {'>'}
      </a> */}
    </div>
  );
};

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');

  const [transitions, setTransactions] = useState<any>([]);
  const [land, setLand] = useState<any>({});
  const [transaction, setTransaction] = useState<any>({});
  const [open, setOpen] = useState(false);

  const showDrawer = (value: any) => {
    setOpen(true);
    setTransaction(value);
    getLand(value.landId).then((res) => {
      if (res.status === 'ok') {
        const __data__ = JSON.parse(res.data === '' ? "{}" : res.data);

        setLand(__data__);
      } else {
        message.error(res.info);
      }
    })
  };

  const onClose = () => {
    setOpen(false);
    setLand({});
  };

  useEffect(() => {
    getAllTransactionList().then((res: any) => {
      if (res.status === 'ok') {
        const __data__ = JSON.parse(res.data === '' ? "[]" : res.data);

        setTransactions(__data__?.slice(0, 10) ?? []);
      } else {
        message.error(res.info);
      }
    })
  }, [])


  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            initialState?.settings?.navTheme === 'realDark'
              ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
              : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: token.colorTextHeading,
            }}
          >
            欢迎使用土地流转系统
          </div>
          <p
            style={{
              fontSize: '14px',
              color: token.colorTextSecondary,
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '65%',
            }}
          >
            本土地流转系统使用了区块链技术，基于Hyperledger Fabric框架的搭建，提供了包括了土地的登记、土地信息浏览和流转的功能。
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <InfoCard
              index={1}
              href="https://umijs.org/docs/introduce/introduce"
              title="土地登记"
              desc="上传你的土地信息以及相关的证明信息，等待管理员的验证通过，后就可以进入土地流转市场供用户查看，用户可以查看土地的信息以及流转的记录。"
            />
            <InfoCard
              index={2}
              title="土地流转"
              href="https://ant.design"
              desc="查看市场中可以流转的土地，发起流转请求，等待土地拥有者的同意后土地的归属权将会立即发生改变你，并且将会通知区块链联盟中的其他组织。"
            />
            <InfoCard
              index={3}
              title="管理资产"
              href="https://procomponents.ant.design"
              desc="在本系统中可以管理自己上传的与流转到自己名下的土地，同时也能管理自己发起的流转与需要处理的流转申请。"
            />
          </div>
        </div>
      </Card>




      <Card
        style={{
          borderRadius: 8,
          marginTop: '2em'
        }}
      >
        <div
          style={{
            fontSize: '20px',
            color: token.colorTextHeading,
          }}
        >
          正在发生的流转
        </div>

        <ProList<any>
          ghost={false}
          itemCardProps={{
            ghost: false,
          }}
          pagination={false}
          showActions="hover"
          rowSelection={false}
          grid={{ gutter: 16, column: 2 }}
          onItem={(record: any) => {
            return {
              onMouseEnter: () => {
                console.log(record);
              },
              onClick: () => {
                console.log(record);
              },
            };
          }}
          metas={{
            title: {},
            subTitle: {},
            type: {},
            avatar: {},
            content: {},
            actions: {
              cardActionProps: 'extra',
            },
          }}
          headerTitle=""
          dataSource={(() => {
            return transitions.map((v: any) => {
              return {
                ...v,
                title: v.name,
                subTitle: <Tag color={statusMap[String(v.status)].color}>{statusMap[String(v.status)].content}</Tag>,
                actions: [<a key="run" onClick={() => { showDrawer(v) }}>详情</a>],
                avatar: "https://gw.alipayobjects.com/zos/antfincdn/UCSiy1j6jx/xingzhuang.svg",
                content: (
                  <div>
                    <ProDescriptions
                      column={2}
                    >
                      <ProDescriptions.Item label="发起流转人" valueType="text">
                        {v.requester}
                      </ProDescriptions.Item>
                      <ProDescriptions.Item label="土地拥有人" valueType="text">
                        {v.validar}
                      </ProDescriptions.Item>


                      <ProDescriptions.Item
                        span={1}
                        valueType="text"
                        contentStyle={{
                          // maxWidth: '80%',
                        }}
                        ellipsis
                        label="流转 ID"
                      >
                        {v.transitionId}
                      </ProDescriptions.Item>

                      <ProDescriptions.Item
                        label="土地 ID"
                        valueType="text"
                      >
                        {v.landId}
                      </ProDescriptions.Item>

                      <ProDescriptions.Item label="出价" valueType="money">
                        {v.price}
                      </ProDescriptions.Item>

                      <ProDescriptions.Item label="日期" valueType="text">
                        {formatDateTime(new Date(Number(v.date)))}
                      </ProDescriptions.Item>
                    </ProDescriptions>
                  </div>
                )
              }
            })
          })()}
        />
      </Card>



      <Drawer title="流转详情" onClose={onClose} open={open} width={800}>
        <TransactionInfo transaction={transaction} />

        <LandDescription land={land} />
      </Drawer>


    </PageContainer >
  );
};

export default Welcome;
