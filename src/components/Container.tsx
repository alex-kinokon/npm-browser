import styled from "@emotion/styled"

export const Container = styled.div`
  margin: 20px auto;
  max-width: 1300px;
  @media (max-width: 1450px) {
    margin: 20px 40px;
  }
  @media (max-width: 768px) {
    margin: 20px 20px;
    .bp5-tab-list {
      overflow: scroll;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
`
