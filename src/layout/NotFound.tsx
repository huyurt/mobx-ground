import React from "react";
import {Segment, Header, Icon, Button} from "semantic-ui-react";
import {Link} from "react-router-dom";

const NotFound = () => {
  return (
    <Segment placeholder>
      <Header icon>
        <Icon name="search" />
        Aradığınız sayfa bulunamadı.
      </Header>
        <Segment.Inline>
            <Button as={Link} to="/" primary>
                Ana sayfaya geri dön
            </Button>
        </Segment.Inline>
    </Segment>
  );
};

export default NotFound;
