import React from 'react'
import { Text, View } from 'react-native'
import ScreenContainer from './ScreenContainer'
import Card from './Card'

/**
 * Demo component to show the new UI components in action
 * This demonstrates that all components are working correctly
 */
export default function UIDemo() {
  return (
    <ScreenContainer gradient="home">
      <View style={{ paddingTop: 20 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          New UI Components Demo
        </Text>
        
        <Card variant="primary" blur={true}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Primary Card with Blur
          </Text>
          <Text style={{ color: '#E5E7EB', marginTop: 8 }}>
            This card uses the new design system with gradient background and blur effect
          </Text>
        </Card>

        <Card variant="secondary" blur={false}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Secondary Card
          </Text>
          <Text style={{ color: '#E5E7EB', marginTop: 8 }}>
            This card has secondary styling without blur
          </Text>
        </Card>

        <Card 
          variant="accent" 
          blur={true}
          onPress={() => console.log('Accent card pressed!')}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Interactive Accent Card
          </Text>
          <Text style={{ color: '#E5E7EB', marginTop: 8 }}>
            This card is pressable and uses accent colors
          </Text>
        </Card>
      </View>
    </ScreenContainer>
  )
}