import {ui} from '../../languages/messages.js';
import React from 'react';
import { Link } from 'react-router-dom';
import '../common/Article.css';

const CumTeAngajezi = () => {
  return (
    <article className="articol-stiri">
      <Link to="/joburi" className="articol-stiri__back">{ui('web_c7324323e36e32f0')}</Link>
      <div className="articol-stiri__card">
        <div className="articol-stiri__header">
          <p className="articol-stiri__meta">{ui('web_4056bbb920194f48')}</p>
          <h1 className="articol-stiri__title">{ui('web_5ccf7f7754878f05')}</h1>
          <p className="articol-stiri__lead">{ui('web_f23bf1e5c5381ca5')}</p>
        </div>
        <div className="articol-stiri__body">
        <section>
          <h2>{ui('web_5c333acb815ec04b')}</h2>
          <p>{ui('web_bc1d938f5a7d8b97')}</p>
          <ul>
            <li><strong>{ui('web_73e17eaa7317b470')}</strong>{ui('web_8cb9d77118cb5da3')}</li>
            <li><strong>{ui('web_15c6c23c59f00ccd')}</strong>{ui('web_7b7b7d1cf0d7d288')}</li>
            <li><strong>{ui('web_0f5fed1791e0ff94')}</strong>{ui('web_d91385921729256b')}</li>
            <li><strong>{ui('web_a9eb35e6b9ebd375')}</strong>{ui('web_8a694f87743466e8')}</li>
            <li><strong>{ui('web_a4caeac1df71d541')}</strong>{ui('web_7b6ecb072ba6bd43')}</li>
          </ul>
          <p>{ui('web_674bbe6fc91eafdd')}<Link to="/joburi/acte" className="articol-stiri__link">{ui('web_2972c444318f8bae')}</Link>.
          </p>
        </section>

        <section>
          <h2>{ui('web_223c691a9366c6dc')}</h2>
          <p>{ui('web_0465dd54183af1ff')}</p>
          <ul>
            <li><strong>{ui('web_25fa2064e89e01f4')}</strong>{ui('web_e90e9cac78631bbf')}</li>
            <li><strong>{ui('web_39205760d06b06dd')}</strong>{ui('web_e1f38e3882f26b17')}</li>
            <li><strong>{ui('web_dd84425b72da12c6')}</strong>{ui('web_3184a42f20f2ad9e')}</li>
            <li><strong>{ui('web_1c37a94ae5684bb7')}</strong>{ui('web_0775c68e51cb7600')}</li>
            <li><strong>{ui('web_66dacdb0978446b1')}</strong>{ui('web_88877c07a9ee1c79')}</li>
            <li><strong>{ui('web_5662c0f0108e851c')}</strong>{ui('web_9070b89d670793db')}</li>
          </ul>
          <p>{ui('web_a5d0abe6ead6535b')}</p>
        </section>

        <section>
          <h2>{ui('web_b369920d82ee4144')}</h2>
          <p>{ui('web_0883f20c7ddbac05')}</p>
          <ul>
            <li><strong>{ui('web_32e11011db8911b2')}</strong>{ui('web_b5c23bcbb5aef702')}</li>
            <li><strong>{ui('web_502f8d33e552b9b8')}</strong>{ui('web_c915c03ad237ee19')}</li>
            <li><strong>{ui('web_ab7b0f3496fe17a3')}</strong>{ui('web_3854eb46ad7090cc')}</li>
            <li><strong>{ui('web_8b828f074dc1f77f')}</strong>{ui('web_114d03cfa766550a')}</li>
            <li><strong>{ui('web_a91026e13e545a2f')}</strong>{ui('web_7dc3e1c01518caf8')}</li>
          </ul>
        </section>

        <section>
          <h2>{ui('web_f6f5c03c8b40fb79')}</h2>
          <p>{ui('web_4d3497a14915cfc9')}</p>

          <h3>{ui('web_84ac060651c28824')}</h3>
          <ul>
            <li><strong>{ui('web_8fc993f4ac301e59')}</strong>{ui('web_3ebb51c8607fd20b')}</li>
            <li><strong>{ui('web_84b8c4e05240a693')}</strong>{ui('web_9542dd2e6a286bb0')}</li>
            <li><strong>{ui('web_373030b5d40ead11')}</strong>{ui('web_fa564212db4f7c0f')}</li>
            <li><strong>{ui('ui_e98b8f11cf37fb63')}</strong>{ui('web_42300bc48eca214d')}</li>
          </ul>

          <h3>{ui('web_9fa7d362dfe21bc4')}</h3>
          <ul>
            <li><strong>{ui('web_1fbb00053c48697e')}</strong>{ui('web_9f971854c3ec3b99')}</li>
            <li><strong>{ui('web_56e976cd377b57f4')}</strong>{ui('web_6f0f3de549416671')}</li>
            <li><strong>{ui('web_8c65bf3dc330d7eb')}</strong>{ui('web_4338425499b9450e')}</li>
          </ul>

          <h3>{ui('web_d9133ba41c7f09bc')}</h3>
          <ul>
            <li><strong>{ui('web_b04d477ff5a7faf7')}</strong>{ui('web_15db7c2e57353607')}</li>
            <li><strong>{ui('web_7da94aa07bf76227')}</strong>{ui('web_7cadfcf6a47a69e5')}</li>
            <li><strong>{ui('web_deae09060dcc8c1b')}</strong>{ui('web_c3d0fedf54896672')}</li>
            <li><strong>{ui('web_4b671cfce17e2e38')}</strong>{ui('web_6b8da41864e56646')}</li>
            <li><strong>{ui('web_1604cfae947414c2')}</strong>{ui('web_4f77d27bdae3fb44')}</li>
          </ul>
        </section>

        <section>
          <h2>{ui('web_c844efdcf2ecda01')}</h2>
          <p>{ui('web_5013869a6160bf02')}<strong>{ui('web_25fa2064e89e01f4')}</strong>{ui('web_313eb2bd1e1c1595')}<strong>{ui('web_59d29bfe4c87cb9e')}</strong>{ui('web_cca48d32b4b8f265')}</p>
        </section>
        </div>
      </div>
    </article>
  );
};

export default CumTeAngajezi;
