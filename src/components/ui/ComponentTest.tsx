import React from 'react'
import { Text, View } from 'react-native'
import { ScreenContainer, Card } from './index'

/**
 * Test component to verify the basic UI components work correctly
 * This can be used for development testing and removed later
 */
export default function ComponentTest() {
  return (
    <ScreenContainer gradient="home">
      <View style={{ paddingTop: 20 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          UI Components Test
        </Text>
        
        <Card variant="primary" blur={true}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Primary Card with Blur
          </Text>
          <Text style={{ color: '#E5E7EB', marginTop: 8 }}>
            This is a primary card with blur effect enabled
          </Text>
        </Card>

        <Card variant="secondary" blur={false}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Secondary Card without Blur
          </Text>
          <Text style={{ color: '#E5E7EB', marginTop: 8 }}>
            This is a secondary card with no blur effect
          </Text>
        </Card>

        <Card 
          variant="accent" 
          blur={true}
          onPress={() => console.log('Card pressed!')}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Pressable Accent Card
          </Text>
          <Text style={{ color: '#E5E7EB', marginTop: 8 }}>
            This card can be pressed and has accent styling
          </Text>
        </Card>
      </View>
    </ScreenContainer>
  )
}