import 'package:crop_farming/app.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('SmartCrop app builds with App root', (tester) async {
    await tester.pumpWidget(const App());
    expect(find.byType(App), findsOneWidget);
  });
}
