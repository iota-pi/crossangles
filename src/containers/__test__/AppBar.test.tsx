import React from 'react';
import AppBar from '../AppBar';
import { shallow, mount, render } from 'enzyme';

describe('<AppBar/>', () => {
  it('renders consistently', () => {
    const wrapper = mount(<AppBar/>);
    expect(wrapper).toMatchSnapshot();
  });

  it('contains app name', () => {
    const wrapper = mount(<AppBar/>);
    expect(wrapper.contains('CrossAngles')).toBe(true);
  });
});
