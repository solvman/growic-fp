import { useContractReader } from "eth-hooks";
import { utils, BigNumber } from "ethers";
import React from "react";
import { Card, Divider, Input, Tooltip, Col, Row, Button } from "antd";
import { Address, Balance } from "../components";
import { useState } from "react";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({
  yourLocalBalance,
  readContracts,
  writeContracts,
  mainnetProvider,
  localProvider,
  price,
  userSigner,
  address,
  blockExplorer,
  contractConfig,
  gasPrice,
  tx,
}) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const contractBalance = useContractReader(readContracts, "LockBox", "getContractBalance");
  const balance = useContractReader(readContracts, "LockBox", "getBalance", [address]);
  const timeLeft = useContractReader(readContracts, "LockBox", "getLockTimeRemaining", [address]);
  const [txValue, setTxValue] = useState();
  const [lockDuration, setLockDuration] = useState();
  const [retrieving, setRetrieving] = useState(false);
  const [locking, setLocking] = useState(false);

  return (
    <div style={{ border: "1px solid #cccccc", padding: 16, width: 900, margin: "auto", marginTop: 64 }}>
      <h1>
        LockBox at{" "}
        <Address
          address={readContracts && readContracts.LockBox ? readContracts.LockBox.address : null}
          ensProvider={mainnetProvider}
          fontSize={24}
        />
      </h1>

      <h2>
        Current total contract locked balance: <Balance balance={contractBalance} price={price} />
      </h2>
      <p style={{ textAlign: "left" }}>
        LockBox is a time-locking smart contract dApp that enables users to securely store their digital assets for a
        predetermined amount of time. The user can choose to lock their assets in the contract for a specific duration,
        and during that time, the assets cannot be accessed or transferred. Once the lockup period ends, the user can
        retrieve their assets. LockBox is designed to be a flexible and customizable solution for various use cases. For
        example, a user could lock up their cryptocurrency for a specific period to prevent impulsive selling or
        trading. Similarly, a company could use LockBox to store their tokens until a specific milestone is reached,
        such as the completion of a project or the achievement of a revenue target.
      </p>
      <Divider />
      <div style={{ display: "flex" }}>
        <div style={{ width: 400, margin: 8 }}>
          <Card title="Lock Value">
            <div>
              <Input
                placeholder="Lock Value in Wei"
                onChange={e => setTxValue(e.target.value)}
                value={txValue}
                addonAfter={
                  <div>
                    <Row>
                      <Col span={16}>
                        <Tooltip placement="right" title=" * 10^18 ">
                          <div
                            type="dashed"
                            style={{ cursor: "pointer" }}
                            onClick={async () => {
                              const floatValue = parseFloat(txValue);
                              if (floatValue) setTxValue("" + floatValue * 10 ** 18);
                            }}
                          >
                            ✳️
                          </div>
                        </Tooltip>
                      </Col>
                    </Row>
                  </div>
                }
              />
              <Input
                placeholder="Lock Duration in milliseconds"
                onChange={e => setLockDuration(e.target.value)}
                value={lockDuration}
              />
              <div style={{ padding: 8 }}>
                <Button
                  type="primary"
                  disabled={!txValue || !lockDuration}
                  loading={locking}
                  onClick={() => {
                    setLocking(true);
                    tx(writeContracts.LockBox.lockFunds(lockDuration, { value: txValue }));
                    setLocking(false);
                  }}
                >
                  Lock Value
                </Button>
              </div>
            </div>
          </Card>
        </div>
        <div style={{ width: 400, margin: 8 }}>
          <Card title="Current Locks">
            <Row>
              <Col>
                <h4>
                  Connected address: <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
                </h4>
              </Col>
            </Row>
            <Row>
              <Col>
                <h4>Locked amount: {balance ? utils.formatEther(balance) : 0} ETH</h4>
              </Col>
            </Row>
            <Row>
              <Col>
                <h4>Time left: {timeLeft ? Number(timeLeft) : 0} milliseconds</h4>
              </Col>
            </Row>
            <Button
              type="primary"
              loading={retrieving}
              // disabled button if timeLeft is > 0 and balance is 0
              disabled={balance == 0}
              onClick={() => {
                setRetrieving(true);
                tx(writeContracts.LockBox.retrieveFunds());
                setRetrieving(false);
              }}
            >
              Retrieve Funds
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Home;
